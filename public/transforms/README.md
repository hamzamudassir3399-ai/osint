# Maltego OSINT Transforms - Tweet & URL Analysis

A set of local Maltego transforms for OSINT investigations that process tweet data and URLs entirely on your machine — no data is sent to remote services.

## Transforms Included

| Transform | Input Entity | Output Entity | Description |
|-----------|-------------|---------------|-------------|
| TweetExtractAliases | Phrase (tweet text) | Alias | Extracts @mentions/usernames |
| TweetExtractHashtags | Phrase (tweet text) | Hashtag | Extracts #hashtags |
| TweetExtractURLs | Phrase (tweet text) | URL | Extracts URLs from tweet text |
| TweetExtractWords | Phrase (tweet text) | Phrase | Extracts meaningful words (stopwords filtered) |
| URLFollowRedirects | URL | URL | Follows shortened links up to 15 redirects |

## Prerequisites

- Python 3.8+
- Maltego Desktop Client (any recent version)
- Internet connection (for URL redirect following only)

## Installation

### 1. Set up the Python environment

```bash
# Clone or copy this project to a local directory
cd maltego-osint-transforms

# Create a virtual environment (recommended)
python -m venv venv

# Activate it
# On Linux/macOS:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Verify transforms are discovered

```bash
python project.py list
```

You should see all 5 transforms listed.

### 3. Test transforms individually

```bash
python transforms/TweetExtractAliases.py
python transforms/TweetExtractHashtags.py
python transforms/TweetExtractURLs.py
python transforms/TweetExtractWords.py
python transforms/URLFollowRedirects.py
```

### 4. Add to Maltego Desktop

For each transform:

1. Open Maltego → **Transforms** tab → **New Local Transform**
2. Fill in the details:
   - **Transform ID**: e.g., `OSINT.TweetExtractAliases`
   - **Transform Display Name**: e.g., `Extract Tweet Aliases`
   - **Input Entity Type**: `maltego.Phrase` (for tweet transforms) or `maltego.URL` (for URL transform)
   - **Author**: Your name
3. On the execution page:
   - **Command**: Full path to your Python interpreter (e.g., `/path/to/venv/bin/python` or `C:\path\to\venv\Scripts\python.exe`)
   - **Parameters**: `project.py local tweetextractaliases` (use the lowercase transform name from `python project.py list`)
   - **Working Directory**: The project root folder (where `project.py` lives)
4. Click **Finish**

### Transform Names for Parameters

Use these exact names in the Parameters field:

| Transform | Parameter Name |
|-----------|---------------|
| TweetExtractAliases | `tweetextractaliases` |
| TweetExtractHashtags | `tweetextracthashtags` |
| TweetExtractURLs | `tweetextracturls` |
| TweetExtractWords | `tweetextractwords` |
| URLFollowRedirects | `urlfollowredirects` |

## Usage

### Tweet Analysis Workflow

1. Paste tweet text as a **Phrase** entity on the graph
2. Right-click → Run any of the tweet transforms
3. Results appear as connected entities

### URL Resolution Workflow

1. Place a URL entity on the graph (e.g., a t.co link from a tweet)
2. Right-click → **URL Follow Redirects**
3. The final destination URL appears, with redirect chain in entity notes

## Project Structure

```
maltego-osint-transforms/
├── project.py              # Transform server entry point
├── requirements.txt        # Python dependencies
├── stopwords.py            # Stopwords list for word filtering
├── README.md               # This file
└── transforms/
    ├── __init__.py         # Auto-discovery module
    ├── TweetExtractAliases.py
    ├── TweetExtractHashtags.py
    ├── TweetExtractURLs.py
    ├── TweetExtractWords.py
    └── URLFollowRedirects.py
```

## Notes

- **All processing is local** — tweet text is never sent to any external service
- The URL redirect transform does make HTTP requests (unavoidable for following links), but no tweet data leaves your machine
- The word extraction uses a built-in stopwords list (~200 common English words + social media noise)
- URL redirect following uses HEAD requests first (faster), falls back to GET if needed
- SSL verification is disabled for the redirect follower to handle misconfigured servers in OSINT contexts
- Maximum 15 redirect hops before stopping (configurable in `URLFollowRedirects.py`)

## Troubleshooting

- **"Transform not found"**: Run `python project.py list` to verify the transform name
- **Permission errors**: Ensure your virtual environment's Python path is correct in Maltego
- **No results**: Check that the input entity type matches (Phrase for tweets, URL for links)
- **Timeouts on URL transform**: Some URLs may be slow; the timeout is 10 seconds per hop

## License

MIT — Use freely for your OSINT investigations.
