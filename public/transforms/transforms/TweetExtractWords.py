"""
TweetExtractWords Transform
=============================
Extracts meaningful words from tweet text, filtering out common stopwords.
Input: Phrase entity containing tweet text
Output: Phrase entities for each unique significant word found
"""

import re
import sys
import os

from maltego_trx.entities import Phrase
from maltego_trx.maltego import UIM_PARTIAL
from maltego_trx.transform import DiscoverableTransform

# Import stopwords - handle both package and standalone execution
try:
    from stopwords import STOPWORDS
except ImportError:
    # Fallback: load from sibling directory
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    from stopwords import STOPWORDS


class TweetExtractWords(DiscoverableTransform):
    """
    Extract meaningful words from tweet text, skipping common stopwords.
    Returns words with length >= 3 characters that are not in the stopwords list.
    """

    # Minimum word length to include
    MIN_WORD_LENGTH = 3

    # Word extraction pattern - matches sequences of word characters
    WORD_PATTERN = re.compile(r'[a-zA-Z]+')

    @classmethod
    def create_entities(cls, request, response):
        tweet_text = request.Value

        if not tweet_text or not tweet_text.strip():
            response.addUIMessage("No tweet text provided.", messageType=UIM_PARTIAL)
            return

        try:
            words = cls.extract_words(tweet_text)
            if words:
                for word in words:
                    entity = response.addEntity(Phrase, word)
                    entity.addNote("source", "Extracted from tweet", "word")
            else:
                response.addUIMessage("No significant words found in the provided text.")
        except Exception as e:
            response.addUIMessage(f"Error extracting words: {str(e)}", messageType=UIM_PARTIAL)

    @staticmethod
    def extract_words(text):
        """
        Extract unique meaningful words from text.
        Filters out:
        - Stopwords (common English words)
        - Words shorter than MIN_WORD_LENGTH
        - Pure numeric strings
        - Twitter-specific noise (@mentions, #hashtags, URLs)
        """
        # First strip out @mentions, #hashtags, and URLs to avoid extracting them as words
        cleaned = re.sub(r'@\w+', ' ', text)       # Remove @mentions
        cleaned = re.sub(r'#\w+', ' ', cleaned)     # Remove #hashtags
        cleaned = re.sub(r'https?://\S+', ' ', cleaned)  # Remove URLs
        cleaned = re.sub(r'www\.\S+', ' ', cleaned)      # Remove www URLs

        # Extract word tokens
        tokens = TweetExtractWords.WORD_PATTERN.findall(cleaned)

        # Filter and deduplicate
        seen = set()
        result = []
        for token in tokens:
            word = token.lower()
            # Skip if too short, is a stopword, or already seen
            if (len(word) >= TweetExtractWords.MIN_WORD_LENGTH
                    and word not in STOPWORDS
                    and word not in seen
                    and not word.isdigit()):
                seen.add(word)
                result.append(word)

        return result


if __name__ == "__main__":
    # Quick test
    sample = "The quick brown fox jumps over the lazy dog! #OSINT @user https://example.com Check this out for cybersecurity research"
    words = TweetExtractWords.extract_words(sample)
    print(f"Found {len(words)} words: {words}")
