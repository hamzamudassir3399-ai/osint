"""
TweetExtractURLs Transform
===========================
Extracts URLs from tweet text.
Input: Phrase entity containing tweet text
Output: URL entities for each unique URL found
"""

import re
from maltego_trx.entities import URL
from maltego_trx.maltego import UIM_PARTIAL
from maltego_trx.transform import DiscoverableTransform


class TweetExtractURLs(DiscoverableTransform):
    """
    Extract URLs from tweet text.
    """

    # Comprehensive URL regex pattern
    # Matches http(s)://, ftp://, and protocol-relative URLs
    URL_PATTERN = re.compile(
        r'(?:https?://|ftp://|www\.)'           # Protocol or www
        r'(?:[^\s<>\"\')\]},;]+)'               # URL body (non-whitespace, non-delimiter)
        r'|'
        r'(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+' # Domain
        r'(?:[a-zA-Z]{2,})'                      # TLD
        r'(?:/[^\s<>\"\')\]},;]*)?',             # Optional path
        re.IGNORECASE
    )

    # Simpler fallback pattern for t.co and other shorteners
    SHORT_URL_PATTERN = re.compile(
        r'https?://[^\s<>\"\')\]},;]+',
        re.IGNORECASE
    )

    @classmethod
    def create_entities(cls, request, response):
        tweet_text = request.Value

        if not tweet_text or not tweet_text.strip():
            response.addUIMessage("No tweet text provided.", messageType=UIM_PARTIAL)
            return

        try:
            urls = cls.extract_urls(tweet_text)
            if urls:
                for url in urls:
                    entity = response.addEntity(URL, url)
                    entity.addNote("source", "Extracted from tweet", "url")
            else:
                response.addUIMessage("No URLs found in the provided text.")
        except Exception as e:
            response.addUIMessage(f"Error extracting URLs: {str(e)}", messageType=UIM_PARTIAL)

    @staticmethod
    def extract_urls(text):
        """Extract unique URLs from text, preserving order of first appearance."""
        # Use the comprehensive pattern
        matches = TweetExtractURLs.URL_PATTERN.findall(text)
        
        # Clean up trailing punctuation that might have been captured
        cleaned = []
        for match in matches:
            if isinstance(match, tuple):
                match = match[0]
            # Strip trailing punctuation that's likely not part of the URL
            url = match.rstrip('.,;:!?)\'\"')
            # Ensure it looks like a valid URL
            if url and (url.startswith('http') or url.startswith('www') or '/' in url):
                if not url.startswith('http'):
                    url = 'https://' + url
                cleaned.append(url)

        # Deduplicate while preserving order
        seen = set()
        result = []
        for url in cleaned:
            normalized = url.lower().rstrip('/')
            if normalized not in seen:
                seen.add(normalized)
                result.append(url)
        return result


if __name__ == "__main__":
    # Quick test
    sample = "Check https://example.com/page and http://bit.ly/abc123! Also www.test.org/path?q=1"
    print(TweetExtractURLs.extract_urls(sample))
