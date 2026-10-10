"""
OSINT Transform Classes
========================
All transform classes in this package are auto-discovered by maltego-trx.
Each class must inherit from DiscoverableTransform and be named after its file.
"""

from .TweetExtractAliases import TweetExtractAliases
from .TweetExtractHashtags import TweetExtractHashtags
from .TweetExtractURLs import TweetExtractURLs
from .TweetExtractWords import TweetExtractWords
from .URLFollowRedirects import URLFollowRedirects

__all__ = [
    "TweetExtractAliases",
    "TweetExtractHashtags",
    "TweetExtractURLs",
    "TweetExtractWords",
    "URLFollowRedirects",
]
