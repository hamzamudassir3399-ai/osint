"""
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
    "what", "which", "who", "whom", "whose",
    # Prepositions
    "at", "by", "for", "from", "in", "into", "of", "on", "to", "with",
    "about", "above", "after", "against", "along", "among", "around",
    "before", "behind", "below", "beneath", "beside", "between", "beyond",
    "down", "during", "inside", "near", "off", "out", "over", "through",
    "under", "until", "up", "upon", "within",
    # Conjunctions
    "and", "but", "or", "nor", "yet", "so", "if", "then", "than",
    "although", "because", "since", "unless", "while", "whereas",
    # Common verbs (auxiliary & high-frequency)
    "am", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "having",
    "do", "does", "did", "doing",
    "will", "would", "shall", "should", "may", "might", "must", "can", "could",
    "go", "goes", "going", "gone",
    "get", "gets", "got", "getting",
    "make", "makes", "made", "making",
    "come", "comes", "came", "coming",
    "take", "takes", "took", "taking",
    "see", "sees", "saw", "seen", "seeing",
    "know", "knows", "knew", "known", "knowing",
    "think", "thinks", "thought", "thinking",
    "say", "says", "said", "saying",
    "tell", "tells", "told", "telling",
    "give", "gives", "gave", "given", "giving",
    "use", "uses", "used", "using",
    "find", "finds", "found", "finding",
    "want", "wants", "wanted", "wanting",
    "look", "looks", "looked", "looking",
    "try", "tries", "tried", "trying",
    "need", "needs", "needed", "needing",
    "feel", "feels", "felt", "feeling",
    "like", "likes", "liked", "liking",
    # Adverbs
    "not", "no", "yes", "just", "also", "very", "really",
    "here", "there", "now", "then", "today", "tomorrow", "yesterday",
    "always", "never", "ever", "often", "sometimes", "usually",
    "already", "still", "again", "once", "even",
    "too", "quite", "rather", "pretty",
    # Other common words
    "all", "any", "both", "each", "few", "more", "most", "other", "some", "such",
    "only", "own", "same", "many", "much",
    "how", "when", "where", "why",
    "as", "at", "be", "but", "if", "in", "it", "on", "or",
    "so", "up", "us", "we",
    # Twitter/social media noise
    "rt", "via", "http", "https", "co", "amp",
    "lol", "omg", "btw", "tbh", "im", "ive", "dont", "cant",
    "wont", "didnt", "doesnt", "wasnt", "werent", "isnt", "arent",
    "hasnt", "havent", "hadnt", "wouldnt", "shouldnt", "couldnt",
    "thats", "whats", "hes", "shes", "its", "theyre", "youre",
    "im", "ive", "youve", "weve", "theyve",
    "hes", "shes", "whos", "hows",
    "gonna", "gotta", "wanna", "lemme", "let", "lets",
    "one", "two", "three", "new", "like", "also", "back",
    "way", "well", "way", "people", "thing", "things",
    "really", "actually", "basically", "literally",
    "good", "great", "nice", "bad", "best", "better",
    "day", "time", "year", "today",
    "first", "last", "next",
})
