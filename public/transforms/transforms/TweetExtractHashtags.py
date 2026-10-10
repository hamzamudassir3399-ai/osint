"""
TweetExtractHashtags Transform
===============================
Extracts #hashtags from tweet text.
Input: Phrase entity containing tweet text
Output: Hashtag entities for each unique hashtag found
"""

import re
from maltego_trx.entities import Hashtag
from maltego_trx.maltego import UIM_PARTIAL
from maltego_trx.transform import DiscoverableTransform


class TweetExtractHashtags(DiscoverableTransform):
    """
    Extract hashtags from tweet text.
    """

    # Regex to match hashtags
    # Matches #word where word contains alphanumeric chars and underscores
    HASHTAG_PATTERN = re.compile(r'(?<!\w)#([A-Za-z0-9_]+)\b')

    @classmethod
    def create_entities(cls, request, response):
        tweet_text = request.Value

        if not tweet_text or not tweet_text.strip():
            response.addUIMessage("No tweet text provided.", messageType=UIM_PARTIAL)
            return

        try:
            hashtags = cls.extract_hashtags(tweet_text)
            if hashtags:
                for tag in hashtags:
                    entity = response.addEntity(Hashtag, tag)
                    entity.addNote("source", "Extracted from tweet", "hashtag")
            else:
                response.addUIMessage("No hashtags found in the provided text.")
        except Exception as e:
            response.addUIMessage(f"Error extracting hashtags: {str(e)}", messageType=UIM_PARTIAL)

    @staticmethod
    def extract_hashtags(text):
        """Extract unique hashtags from text, preserving order of first appearance."""
        matches = TweetExtractHashtags.HASHTAG_PATTERN.findall(text)
        seen = set()
        result = []
        for match in matches:
            lower = match.lower()
            if lower not in seen:
                seen.add(lower)
                result.append(match)
        return result


if __name__ == "__main__":
    # Quick test
    sample = "Check out #OSINT and #CyberSecurity! #osint is great for #Research"
    print(TweetExtractHashtags.extract_hashtags(sample))
