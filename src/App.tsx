import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  Code,
  Terminal,
  GitBranch,
  Hash,
  Link,
  Type,
  ArrowRightLeft,
  Copy,
  Check,
  FolderTree,
  BookOpen,
  Shield,
  Zap,
  Download,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

// Transform data
const transforms = [
  {
    id: 'aliases',
    name: 'TweetExtractAliases',
    icon: <GitBranch className="w-5 h-5" />,
    input: 'Phrase (tweet text)',
    output: 'Alias',
    description: 'Extracts @mentions/usernames from tweet text using regex pattern matching.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'hashtags',
    name: 'TweetExtractHashtags',
    icon: <Hash className="w-5 h-5" />,
    input: 'Phrase (tweet text)',
    output: 'Hashtag',
    description: 'Extracts #hashtags from tweet text, deduplicating case-insensitively.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'urls',
    name: 'TweetExtractURLs',
    icon: <Link className="w-5 h-5" />,
    input: 'Phrase (tweet text)',
    output: 'URL',
    description: 'Extracts URLs from tweet text including shortened links and t.co wrappers.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'words',
    name: 'TweetExtractWords',
    icon: <Type className="w-5 h-5" />,
    input: 'Phrase (tweet text)',
    output: 'Phrase',
    description: 'Extracts meaningful words from tweets, filtering ~200 common English stopwords and social media noise.',
    color: 'from-orange-500 to-amber-500',
  },
  {
    id: 'redirects',
    name: 'URLFollowRedirects',
    icon: <ArrowRightLeft className="w-5 h-5" />,
    input: 'URL',
    output: 'URL',
    description: 'Follows shortened/redirected URLs up to 15 hops, returning the final destination with full redirect chain.',
    color: 'from-red-500 to-rose-500',
  },
];

// Code snippets for display
const codeSnippets: Record<string, string> = {
  aliases: `"""
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
    MENTION_PATTERN = re.compile(r'(?<!\\w)@([A-Za-z0-9_]{1,15})\\b')

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
        return result`,

  hashtags: `"""
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
    HASHTAG_PATTERN = re.compile(r'(?<!\\w)#([A-Za-z0-9_]+)\\b')

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
        return result`,

  urls: `"""
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
    URL_PATTERN = re.compile(
        r'(?:https?://|ftp://|www\\.)'
        r'(?:[^\\s<>\\"\\')\\]},;]+)'
        r'|'
        r'(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\\.)+' 
        r'(?:[a-zA-Z]{2,})'
        r'(?:/[^\\s<>\\"\\')\\]},;]*)?',
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
        matches = TweetExtractURLs.URL_PATTERN.findall(text)
        
        cleaned = []
        for match in matches:
            if isinstance(match, tuple):
                match = match[0]
            url = match.rstrip('.,;:!?)\\'\\\"')
            if url and (url.startswith('http') or url.startswith('www') or '/' in url):
                if not url.startswith('http'):
                    url = 'https://' + url
                cleaned.append(url)

        seen = set()
        result = []
        for url in cleaned:
            normalized = url.lower().rstrip('/')
            if normalized not in seen:
                seen.add(normalized)
                result.append(url)
        return result`,

  words: `"""
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

try:
    from stopwords import STOPWORDS
except ImportError:
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    from stopwords import STOPWORDS


class TweetExtractWords(DiscoverableTransform):
    """
    Extract meaningful words from tweet text, skipping common stopwords.
    Returns words with length >= 3 characters that are not in the stopwords list.
    """

    MIN_WORD_LENGTH = 3
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
        Filters out stopwords, short words, and Twitter noise.
        """
        # Strip out @mentions, #hashtags, and URLs
        cleaned = re.sub(r'@\\w+', ' ', text)
        cleaned = re.sub(r'#\\w+', ' ', cleaned)
        cleaned = re.sub(r'https?://\\S+', ' ', cleaned)
        cleaned = re.sub(r'www\\.\\S+', ' ', cleaned)

        tokens = TweetExtractWords.WORD_PATTERN.findall(cleaned)

        seen = set()
        result = []
        for token in tokens:
            word = token.lower()
            if (len(word) >= TweetExtractWords.MIN_WORD_LENGTH
                    and word not in STOPWORDS
                    and word not in seen
                    and not word.isdigit()):
                seen.add(word)
                result.append(word)

        return result`,

  redirects: `"""
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

    MAX_REDIRECTS = 15
    REQUEST_TIMEOUT = 10
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

        if not input_url.startswith(('http://', 'https://')):
            input_url = 'https://' + input_url

        try:
            final_url, redirect_chain = cls.follow_redirects(input_url)

            if final_url and final_url != input_url:
                entity = response.addEntity(URL, final_url)
                entity.addNote("redirect_info",
                               f"Resolved after {len(redirect_chain)} redirect(s)",
                               "redirect_chain")
                for i, hop in enumerate(redirect_chain, 1):
                    entity.addNote(f"hop_{i}", hop, "redirect_chain")
            elif final_url == input_url:
                response.addUIMessage(
                    f"URL did not redirect. Final destination: {final_url}"
                )
            else:
                response.addUIMessage(
                    "Could not resolve the URL.",
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
            if current_url in visited:
                break
            visited.add(current_url)

            try:
                ctx = ssl.create_default_context()
                ctx.check_hostname = False
                ctx.verify_mode = ssl.CERT_NONE

                req = urllib.request.Request(
                    current_url,
                    method='HEAD',
                    headers={
                        'User-Agent': cls.USER_AGENT,
                        'Accept': '*/*',
                    }
                )

                try:
                    resp = urllib.request.urlopen(
                        req, timeout=cls.REQUEST_TIMEOUT, context=ctx
                    )
                    final_url = resp.geturl()
                    if final_url != current_url:
                        redirect_chain.append(final_url)
                    return final_url, redirect_chain

                except urllib.error.HTTPError as e:
                    if e.code in (301, 302, 303, 307, 308):
                        location = e.headers.get('Location')
                        if location:
                            redirect_chain.append(current_url)
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
                        return cls._try_get_request(current_url, redirect_chain, ctx)

                except (urllib.error.URLError, socket.timeout):
                    return cls._try_get_request(current_url, redirect_chain, ctx)

            except Exception:
                return current_url, redirect_chain

        return current_url, redirect_chain`,

  project: `#!/usr/bin/env python3
"""
Maltego Local Transform Server - OSINT Tweet & URL Analysis
============================================================
Entry point for the local transform server.
Run with: python project.py local
"""

import sys
import transforms

from maltego_trx.server import app, application
from maltego_trx.handler import handle_run
from maltego_trx.registry import register_transform_classes

# Auto-discover all transform classes in the transforms/ package
register_transform_classes(transforms)

# Start the transform server
handle_run(__name__, sys.argv, app)`,

  stopwords: `"""
Common English stopwords for filtering tweet word extraction.
Based on the NLTK English stopwords corpus plus common social media noise words.
"""

STOPWORDS = frozenset({
    # Articles & determiners
    "a", "an", "the", "this", "that", "these", "those",
    # Pronouns
    "i", "me", "my", "myself", "we", "our", "ours", "ourselves",
    "you", "your", "yours", "yourself", "yourselves",
    "he", "him", "his", "himself", "she", "her", "hers", "herself",
    "it", "its", "itself", "they", "them", "their", "theirs", "themselves",
    # ... (full list contains ~200 words)
    
    # Twitter/social media noise
    "rt", "via", "http", "https", "co", "amp",
    "lol", "omg", "btw", "tbh", "im", "ive", "dont", "cant",
    "gonna", "gotta", "wanna", "lemme", "let", "lets",
    # ... (complete list in stopwords.py)
})`,
};

// CodeBlock component with copy button
function CodeBlock({ code, language = 'python', filename }: { code: string; language?: string; filename?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-lg overflow-hidden border border-gray-700 bg-gray-900">
      {filename && (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
          <span className="text-sm text-gray-400 font-mono">{filename}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600 rounded transition-colors"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      )}
      {!filename && (
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-white bg-gray-700/80 hover:bg-gray-600 rounded transition-colors opacity-0 group-hover:opacity-100 z-10"
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      )}
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{
          margin: 0,
          padding: '1rem',
          fontSize: '0.8rem',
          lineHeight: '1.5',
          background: 'transparent',
        }}
        wrapLines={true}
        showLineNumbers={true}
        lineNumberStyle={{ color: '#4a5568', minWidth: '2.5em' }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

// Collapsible section
function CollapsibleSection({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-800 hover:bg-gray-750 transition-colors text-left"
      >
        <span className="font-medium text-gray-200">{title}</span>
        {open ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
      </button>
      {open && <div className="p-4 bg-gray-900">{children}</div>}
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [activeTransform, setActiveTransform] = useState('aliases');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'transforms', label: 'Transforms', icon: <Code className="w-4 h-4" /> },
    { id: 'setup', label: 'Setup Guide', icon: <Terminal className="w-4 h-4" /> },
    { id: 'structure', label: 'Project Files', icon: <FolderTree className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Maltego OSINT Transforms</h1>
                <p className="text-xs text-gray-400">Tweet & URL Analysis • Local Processing</p>
              </div>
            </div>
            <a
              href="/transforms/README.md"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download Files</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-gray-800">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/10 to-transparent" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.05) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(168, 85, 247, 0.05) 0%, transparent 50%)' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-xs font-medium text-blue-300 bg-blue-500/10 border border-blue-500/20 rounded-full">
              <Zap className="w-3 h-3" />
              100% Local Processing — No Data Leaves Your Machine
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Custom Maltego Transforms for{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                OSINT Analysis
              </span>
            </h2>
            <p className="text-lg text-gray-400 mb-8">
              Extract aliases, hashtags, URLs, and meaningful words from tweets.
              Follow shortened links through up to 15 redirects. All running locally via Python.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {transforms.map((t) => (
                <div
                  key={t.id}
                  className={`flex items-center gap-2 px-3 py-2 bg-gradient-to-r ${t.color} bg-opacity-10 border border-gray-700 rounded-lg text-sm`}
                  style={{ background: 'rgba(31, 41, 55, 0.8)' }}
                >
                  <span className="text-gray-300">{t.icon}</span>
                  <span className="text-gray-300 font-mono text-xs">{t.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <nav className="border-b border-gray-800 bg-gray-900/30 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {transforms.map((t) => (
                <div
                  key={t.id}
                  className="p-5 bg-gray-900 border border-gray-800 rounded-xl hover:border-gray-600 transition-colors cursor-pointer"
                  onClick={() => { setActiveTab('transforms'); setActiveTransform(t.id); }}
                >
                  <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br ${t.color} mb-3`}>
                    {t.icon}
                  </div>
                  <h3 className="font-mono text-sm font-semibold text-white mb-1">{t.name}</h3>
                  <p className="text-sm text-gray-400 mb-3">{t.description}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 bg-gray-800 text-gray-300 rounded">{t.input}</span>
                    <span className="text-gray-500">→</span>
                    <span className="px-2 py-0.5 bg-gray-800 text-gray-300 rounded">{t.output}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 bg-gray-900 border border-gray-800 rounded-xl">
                <Shield className="w-8 h-8 text-green-400 mb-3" />
                <h4 className="font-semibold text-white mb-2">Privacy First</h4>
                <p className="text-sm text-gray-400">All tweet parsing happens locally. No data is sent to remote services.</p>
              </div>
              <div className="p-5 bg-gray-900 border border-gray-800 rounded-xl">
                <Zap className="w-8 h-8 text-yellow-400 mb-3" />
                <h4 className="font-semibold text-white mb-2">Fast & Lightweight</h4>
                <p className="text-sm text-gray-400">Regex-based parsing with zero external dependencies beyond maltego-trx.</p>
              </div>
              <div className="p-5 bg-gray-900 border border-gray-800 rounded-xl">
                <Terminal className="w-8 h-8 text-blue-400 mb-3" />
                <h4 className="font-semibold text-white mb-2">Easy Setup</h4>
                <p className="text-sm text-gray-400">One pip install, add to Maltego as local transforms, done.</p>
              </div>
            </div>

            {/* Architecture diagram */}
            <div className="p-6 bg-gray-900 border border-gray-800 rounded-xl">
              <h3 className="text-lg font-semibold text-white mb-4">How It Works</h3>
              <div className="flex flex-col md:flex-row items-center gap-4 text-center">
                <div className="flex-1 p-4 bg-gray-800 rounded-lg border border-gray-700">
                  <div className="text-2xl mb-2">📝</div>
                  <div className="text-sm font-medium text-white">Tweet Text</div>
                  <div className="text-xs text-gray-400">Phrase Entity</div>
                </div>
                <div className="text-gray-500 text-2xl">→</div>
                <div className="flex-1 p-4 bg-gray-800 rounded-lg border border-blue-500/30">
                  <div className="text-2xl mb-2">⚙️</div>
                  <div className="text-sm font-medium text-white">Local Transform</div>
                  <div className="text-xs text-gray-400">Python + Regex</div>
                </div>
                <div className="text-gray-500 text-2xl">→</div>
                <div className="flex-1 p-4 bg-gray-800 rounded-lg border border-gray-700">
                  <div className="text-2xl mb-2">🔗</div>
                  <div className="text-sm font-medium text-white">Entities</div>
                  <div className="text-xs text-gray-400">Alias / Hashtag / URL / Phrase</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transforms Tab */}
        {activeTab === 'transforms' && (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <div className="lg:w-64 flex-shrink-0">
              <div className="sticky top-36 space-y-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">Transforms</p>
                {transforms.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTransform(t.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                      activeTransform === t.id
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                    }`}
                  >
                    <span className={activeTransform === t.id ? 'text-blue-400' : ''}>{t.icon}</span>
                    <span className="font-mono text-xs truncate">{t.name}</span>
                  </button>
                ))}
                <div className="pt-4 border-t border-gray-800 mt-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">Support Files</p>
                  <button
                    onClick={() => setActiveTransform('project')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                      activeTransform === 'project'
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                    }`}
                  >
                    <Terminal className="w-4 h-4" />
                    <span className="font-mono text-xs">project.py</span>
                  </button>
                  <button
                    onClick={() => setActiveTransform('stopwords')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                      activeTransform === 'stopwords'
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                    }`}
                  >
                    <Type className="w-4 h-4" />
                    <span className="font-mono text-xs">stopwords.py</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Code Display */}
            <div className="flex-1 min-w-0">
              {activeTransform === 'project' && (
                <div>
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-white">project.py</h3>
                    <p className="text-sm text-gray-400 mt-1">Transform server entry point. Auto-discovers all transforms in the transforms/ package.</p>
                  </div>
                  <CodeBlock code={codeSnippets.project} filename="project.py" />
                </div>
              )}
              {activeTransform === 'stopwords' && (
                <div>
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-white">stopwords.py</h3>
                    <p className="text-sm text-gray-400 mt-1">Common English stopwords (~200 words) plus social media noise words for filtering.</p>
                  </div>
                  <CodeBlock code={codeSnippets.stopwords} filename="stopwords.py" />
                </div>
              )}
              {transforms.find(t => t.id === activeTransform) && (() => {
                const t = transforms.find(t => t.id === activeTransform)!;
                return (
                  <div>
                    <div className="mb-4 flex items-start gap-4">
                      <div className={`flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br ${t.color}`}>
                        {t.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{t.name}</h3>
                        <p className="text-sm text-gray-400 mt-1">{t.description}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs">
                          <span className="px-2 py-0.5 bg-gray-800 text-gray-300 rounded border border-gray-700">Input: {t.input}</span>
                          <span className="text-gray-500">→</span>
                          <span className="px-2 py-0.5 bg-gray-800 text-gray-300 rounded border border-gray-700">Output: {t.output}</span>
                        </div>
                      </div>
                    </div>
                    <CodeBlock code={codeSnippets[activeTransform]} filename={`transforms/${t.name}.py`} />
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Setup Tab */}
        {activeTab === 'setup' && (
          <div className="max-w-4xl space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Installation & Setup</h3>
              <p className="text-gray-400">Follow these steps to get the transforms running in your Maltego desktop client.</p>
            </div>

            {/* Step 1 */}
            <div className="p-5 bg-gray-900 border border-gray-800 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 text-sm font-bold">1</span>
                <h4 className="font-semibold text-white">Install Dependencies</h4>
              </div>
              <CodeBlock
                language="bash"
                code={`# Navigate to the project directory
cd maltego-osint-transforms

# Create a virtual environment (recommended)
python -m venv venv

# Activate it
# Linux/macOS:
source venv/bin/activate
# Windows:
venv\\Scripts\\activate

# Install the only required dependency
pip install maltego-trx>=1.6.0`}
              />
            </div>

            {/* Step 2 */}
            <div className="p-5 bg-gray-900 border border-gray-800 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 text-sm font-bold">2</span>
                <h4 className="font-semibold text-white">Verify Transforms Are Discovered</h4>
              </div>
              <CodeBlock
                language="bash"
                code={`# List all discovered transforms
python project.py list

# Expected output:
# TweetExtractAliases
# TweetExtractHashtags
# TweetExtractURLs
# TweetExtractWords
# URLFollowRedirects`}
              />
            </div>

            {/* Step 3 */}
            <div className="p-5 bg-gray-900 border border-gray-800 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 text-sm font-bold">3</span>
                <h4 className="font-semibold text-white">Add to Maltego Desktop</h4>
              </div>
              <div className="space-y-3 text-sm text-gray-300">
                <p>For each transform, open Maltego → <strong>Transforms</strong> tab → <strong>New Local Transform</strong></p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border border-gray-700 rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-gray-800">
                        <th className="px-3 py-2 text-left text-gray-300">Field</th>
                        <th className="px-3 py-2 text-left text-gray-300">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-gray-700">
                        <td className="px-3 py-2 text-gray-400">Transform ID</td>
                        <td className="px-3 py-2 font-mono text-green-400">OSINT.TweetExtractAliases</td>
                      </tr>
                      <tr className="border-t border-gray-700">
                        <td className="px-3 py-2 text-gray-400">Input Entity Type</td>
                        <td className="px-3 py-2 font-mono text-green-400">maltego.Phrase</td>
                      </tr>
                      <tr className="border-t border-gray-700">
                        <td className="px-3 py-2 text-gray-400">Command</td>
                        <td className="px-3 py-2 font-mono text-green-400">/path/to/venv/bin/python</td>
                      </tr>
                      <tr className="border-t border-gray-700">
                        <td className="px-3 py-2 text-gray-400">Parameters</td>
                        <td className="px-3 py-2 font-mono text-green-400">project.py local tweetextractaliases</td>
                      </tr>
                      <tr className="border-t border-gray-700">
                        <td className="px-3 py-2 text-gray-400">Working Directory</td>
                        <td className="px-3 py-2 font-mono text-green-400">/path/to/maltego-osint-transforms</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Step 4 - Transform names reference */}
            <div className="p-5 bg-gray-900 border border-gray-800 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 text-sm font-bold">4</span>
                <h4 className="font-semibold text-white">Transform Parameter Reference</h4>
              </div>
              <p className="text-sm text-gray-400 mb-3">Use these names in the Parameters field when adding each transform:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {transforms.map((t) => (
                  <div key={t.id} className="flex items-center gap-2 p-2 bg-gray-800 rounded-lg">
                    <span className="text-gray-400">{t.icon}</span>
                    <code className="text-xs text-green-400 font-mono">
                      project.py local {t.name.toLowerCase()}
                    </code>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick test */}
            <div className="p-5 bg-gray-900 border border-gray-800 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-green-500/20 text-green-400 text-sm font-bold">✓</span>
                <h4 className="font-semibold text-white">Quick Test (Optional)</h4>
              </div>
              <p className="text-sm text-gray-400 mb-3">Each transform file can be run standalone for quick testing:</p>
              <CodeBlock
                language="bash"
                code={`# Test individual transforms
python transforms/TweetExtractAliases.py
python transforms/TweetExtractHashtags.py
python transforms/TweetExtractURLs.py
python transforms/TweetExtractWords.py
python transforms/URLFollowRedirects.py`}
              />
            </div>
          </div>
        )}

        {/* Structure Tab */}
        {activeTab === 'structure' && (
          <div className="max-w-4xl space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Project Structure</h3>
              <p className="text-gray-400">Complete file listing with descriptions.</p>
            </div>

            {/* File tree */}
            <div className="p-5 bg-gray-900 border border-gray-800 rounded-xl">
              <div className="font-mono text-sm space-y-1">
                <div className="text-yellow-400 font-semibold">maltego-osint-transforms/</div>
                <div className="pl-4 flex items-center gap-2 text-gray-300">
                  <span className="text-blue-400">├──</span>
                  <span className="text-green-400">📄</span>
                  <span>project.py</span>
                  <span className="text-gray-500 text-xs ml-2">— Transform server entry point</span>
                </div>
                <div className="pl-4 flex items-center gap-2 text-gray-300">
                  <span className="text-blue-400">├──</span>
                  <span className="text-green-400">📄</span>
                  <span>requirements.txt</span>
                  <span className="text-gray-500 text-xs ml-2">— Python dependencies</span>
                </div>
                <div className="pl-4 flex items-center gap-2 text-gray-300">
                  <span className="text-blue-400">├──</span>
                  <span className="text-green-400">📄</span>
                  <span>stopwords.py</span>
                  <span className="text-gray-500 text-xs ml-2">— Stopwords list (~200 words)</span>
                </div>
                <div className="pl-4 flex items-center gap-2 text-gray-300">
                  <span className="text-blue-400">├──</span>
                  <span className="text-green-400">📄</span>
                  <span>README.md</span>
                  <span className="text-gray-500 text-xs ml-2">— Documentation</span>
                </div>
                <div className="pl-4 flex items-center gap-2 text-gray-300">
                  <span className="text-blue-400">└──</span>
                  <span className="text-yellow-400">📁</span>
                  <span className="text-yellow-300">transforms/</span>
                </div>
                <div className="pl-10 flex items-center gap-2 text-gray-300">
                  <span className="text-blue-400">├──</span>
                  <span className="text-green-400">📄</span>
                  <span>__init__.py</span>
                  <span className="text-gray-500 text-xs ml-2">— Auto-discovery module</span>
                </div>
                <div className="pl-10 flex items-center gap-2 text-gray-300">
                  <span className="text-blue-400">├──</span>
                  <span className="text-green-400">📄</span>
                  <span>TweetExtractAliases.py</span>
                  <span className="text-gray-500 text-xs ml-2">— @mention extraction</span>
                </div>
                <div className="pl-10 flex items-center gap-2 text-gray-300">
                  <span className="text-blue-400">├──</span>
                  <span className="text-green-400">📄</span>
                  <span>TweetExtractHashtags.py</span>
                  <span className="text-gray-500 text-xs ml-2">— Hashtag extraction</span>
                </div>
                <div className="pl-10 flex items-center gap-2 text-gray-300">
                  <span className="text-blue-400">├──</span>
                  <span className="text-green-400">📄</span>
                  <span>TweetExtractURLs.py</span>
                  <span className="text-gray-500 text-xs ml-2">— URL extraction</span>
                </div>
                <div className="pl-10 flex items-center gap-2 text-gray-300">
                  <span className="text-blue-400">├──</span>
                  <span className="text-green-400">📄</span>
                  <span>TweetExtractWords.py</span>
                  <span className="text-gray-500 text-xs ml-2">— Word extraction (filtered)</span>
                </div>
                <div className="pl-10 flex items-center gap-2 text-gray-300">
                  <span className="text-blue-400">└──</span>
                  <span className="text-green-400">📄</span>
                  <span>URLFollowRedirects.py</span>
                  <span className="text-gray-500 text-xs ml-2">— URL redirect follower</span>
                </div>
              </div>
            </div>

            {/* Individual file viewers */}
            <h4 className="text-lg font-semibold text-white">File Contents</h4>
            <div className="space-y-4">
              <CollapsibleSection title="requirements.txt">
                <CodeBlock
                  language="text"
                  code={`# Maltego OSINT Transforms - Dependencies
# Install with: pip install -r requirements.txt

maltego-trx>=1.6.0`}
                />
              </CollapsibleSection>

              <CollapsibleSection title="transforms/__init__.py">
                <CodeBlock
                  code={`"""
OSINT Transform Classes
========================
All transform classes in this package are auto-discovered by maltego-trx.
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
]`}
                  filename="transforms/__init__.py"
                />
              </CollapsibleSection>

              <CollapsibleSection title="stopwords.py (excerpt)">
                <CodeBlock code={codeSnippets.stopwords} filename="stopwords.py" />
              </CollapsibleSection>
            </div>

            {/* Notes */}
            <div className="p-5 bg-gray-900 border border-gray-800 rounded-xl">
              <h4 className="font-semibold text-white mb-3">Key Design Decisions</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span><strong className="text-gray-200">No external API calls for tweet parsing</strong> — all regex-based, runs instantly</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span><strong className="text-gray-200">HEAD requests first</strong> for URL redirect following (faster, no body download)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span><strong className="text-gray-200">SSL verification disabled</strong> for OSINT context — handles misconfigured servers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span><strong className="text-gray-200">Redirect loop detection</strong> via visited-set tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span><strong className="text-gray-200">Stopwords include social media noise</strong> — rt, via, amp, lol, gonna, etc.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span><strong className="text-gray-200">Deduplication is case-insensitive</strong> but preserves original casing in output</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-900/30 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm text-gray-400">Maltego OSINT Transforms — Tweet & URL Analysis</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>Python 3.8+</span>
              <span>•</span>
              <span>maltego-trx ≥ 1.6.0</span>
              <span>•</span>
              <span>MIT License</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
