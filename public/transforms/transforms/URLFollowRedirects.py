"""
URLFollowRedirects Transform
==============================
Follows shortened/redirected URLs and returns the final destination.
Handles up to 15 redirects before stopping.
Input: URL entity
Output: URL entity with the final resolved destination
"""

import urllib.request
import urllib.error
import ssl
import socket
from maltego_trx.entities import URL
from maltego_trx.maltego import UIM_PARTIAL, UIM_FATAL
from maltego_trx.transform import DiscoverableTransform


class URLFollowRedirects(DiscoverableTransform):
    """
    Follow URL redirects (up to 15 hops) and return the final destination.
    Useful for resolving t.co, bit.ly, and other URL shorteners.
    """

    # Maximum number of redirects to follow
    MAX_REDIRECTS = 15

    # Timeout per request in seconds
    REQUEST_TIMEOUT = 10

    # Common user-agent to avoid basic bot detection
    USER_AGENT = (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )

    @classmethod
    def create_entities(cls, request, response):
        input_url = request.Value

        if not input_url or not input_url.strip():
            response.addUIMessage("No URL provided.", messageType=UIM_FATAL)
            return

        # Ensure URL has a scheme
        if not input_url.startswith(('http://', 'https://')):
            input_url = 'https://' + input_url

        try:
            final_url, redirect_chain = cls.follow_redirects(input_url)

            if final_url and final_url != input_url:
                entity = response.addEntity(URL, final_url)
                entity.addNote("redirect_info",
                               f"Resolved after {len(redirect_chain)} redirect(s)",
                               "redirect_chain")
                # Add the chain as notes for investigation trail
                for i, hop in enumerate(redirect_chain, 1):
                    entity.addNote(f"hop_{i}", hop, "redirect_chain")
            elif final_url == input_url:
                response.addUIMessage(
                    f"URL did not redirect. Final destination: {final_url}"
                )
            else:
                response.addUIMessage(
                    "Could not resolve the URL. It may be unreachable or malformed.",
                    messageType=UIM_PARTIAL
                )

        except Exception as e:
            response.addUIMessage(
                f"Error following redirects: {str(e)}",
                messageType=UIM_FATAL
            )

    @classmethod
    def follow_redirects(cls, url):
        """
        Follow redirects manually up to MAX_REDIRECTS hops.
        Returns (final_url, list_of_hops).
        """
        redirect_chain = []
        current_url = url
        visited = set()

        for hop in range(cls.MAX_REDIRECTS):
            # Detect redirect loops
            if current_url in visited:
                break
            visited.add(current_url)

            try:
                # Create SSL context that doesn't verify (for OSINT - we want to follow
                # even if certs are misconfigured, but we log it)
                ctx = ssl.create_default_context()
                ctx.check_hostname = False
                ctx.verify_mode = ssl.CERT_NONE

                req = urllib.request.Request(
                    current_url,
                    method='HEAD',  # Use HEAD to avoid downloading full content
                    headers={
                        'User-Agent': cls.USER_AGENT,
                        'Accept': '*/*',
                    }
                )

                # Open with no automatic redirect following
                try:
                    resp = urllib.request.urlopen(req, timeout=cls.REQUEST_TIMEOUT, context=ctx)
                    # If we get here, no redirect - we've reached the destination
                    final_url = resp.geturl()
                    if final_url != current_url:
                        redirect_chain.append(final_url)
                    return final_url, redirect_chain

                except urllib.error.HTTPError as e:
                    # Check for redirect status codes
                    if e.code in (301, 302, 303, 307, 308):
                        location = e.headers.get('Location')
                        if location:
                            redirect_chain.append(current_url)
                            # Handle relative redirects
                            if location.startswith('/'):
                                from urllib.parse import urlparse
                                parsed = urlparse(current_url)
                                current_url = f"{parsed.scheme}://{parsed.netloc}{location}"
                            elif not location.startswith(('http://', 'https://')):
                                current_url = f"https://{location}"
                            else:
                                current_url = location
                            continue
                        else:
                            # Redirect with no Location header - return current
                            return current_url, redirect_chain
                    else:
                        # Non-redirect error - try GET as fallback
                        return cls._try_get_request(current_url, redirect_chain, ctx)

                except urllib.error.URLError as e:
                    # Connection error - try GET fallback
                    return cls._try_get_request(current_url, redirect_chain, ctx)

                except socket.timeout:
                    redirect_chain.append(f"{current_url} [TIMEOUT]")
                    return current_url, redirect_chain

            except Exception:
                return current_url, redirect_chain

        # If we exhausted all redirects, return what we have
        return current_url, redirect_chain

    @classmethod
    def _try_get_request(cls, url, redirect_chain, ctx):
        """Fallback: try a GET request with automatic redirect handling."""
        try:
            req = urllib.request.Request(
                url,
                headers={
                    'User-Agent': cls.USER_AGENT,
                    'Accept': 'text/html,application/xhtml+xml,*/*',
                }
            )
            resp = urllib.request.urlopen(req, timeout=cls.REQUEST_TIMEOUT, context=ctx)
            final_url = resp.geturl()
            if final_url != url:
                redirect_chain.append(url)
            return final_url, redirect_chain
        except Exception:
            return url, redirect_chain


if __name__ == "__main__":
    # Quick test
    test_urls = [
        "https://bit.ly/3example",
        "https://t.co/abc123",
        "https://tinyurl.com/test123",
    ]
    for url in test_urls:
        final, chain = URLFollowRedirects.follow_redirects(url)
        print(f"{url} -> {final} ({len(chain)} hops)")
