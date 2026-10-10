"""
TweetExtractAliases Transform
==============================
Extracts @mentions (aliases/usernames) from tweet text.
Input: Phrase entity containing tweet text
Output: Alias entities for each unique @mention found
"""

import re
from maltego_trx.entities import Alias
from maltego_trx.maltego import UIM_PARTIAL
from maltego_trx.transform import DiscoverableTransform


class TweetExtractAliases(DiscoverableTransform):
    """
    Extract @mention aliases from tweet text.
    """

    # Regex to match Twitter/X @mentions
    # Matches @username where username is 1-15 alphanumeric chars + underscores
    MENTION_PATTERN = re.compile(r'(?<!\w)@([A-Za-z0-9_]{1,15})\b')

    @classmethod
    def create_entities(cls, request, response):
        tweet_text = request.Value

        if not tweet_text or not tweet_text.strip():
            response.addUIMessage("No tweet text provided.", messageType=UIM_PARTIAL)
            return

        try:
            mentions = cls.extract_aliases(tweet_text)
            if mentions:
                for alias in mentions:
                    entity = response.addEntity(Alias, alias)
                    entity.addNote("source", "Extracted from tweet", "alias")
            else:
                response.addUIMessage("No @mentions found in the provided text.")
        except Exception as e:
            response.addUIMessage(f"Error extracting aliases: {str(e)}", messageType=UIM_PARTIAL)

    @staticmethod
    def extract_aliases(text):
        """Extract unique @mentions from text, preserving order of first appearance."""
        matches = TweetExtractAliases.MENTION_PATTERN.findall(text)
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
    sample = "Hey @JohnDoe and @alice check this out! @JohnDoe RT this @Bob_123"
    print(TweetExtractAliases.extract_aliases(sample))
