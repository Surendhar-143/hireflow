import math
import re
from collections import Counter
from typing import List, Dict, Set

# Set of standard English stop words to filter out
STOP_WORDS: Set[str] = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't",
    "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by",
    "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't",
    "down", "during", "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't", "have",
    "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself", "him",
    "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't",
    "it", "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", "my", "myself", "no", "nor",
    "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out",
    "over", "own", "same", "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so", "some",
    "such", "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then", "there",
    "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this", "those", "through",
    "to", "too", "under", "until", "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've",
    "were", "weren't", "what", "what's", "when", "when's", "where", "where's", "which", "while", "who",
    "who's", "whom", "why", "why's", "with", "won't", "would", "wouldn't", "you", "you'd", "you'll",
    "you're", "you've", "your", "yours", "yourself", "yourselves"
}

def tokenize(text: str) -> List[str]:
    """Tokenize text into lowercase words, removing special characters and stop words."""
    if not text:
        return []
    words = re.findall(r'\b\w+\b', text.lower())
    return [w for w in words if w not in STOP_WORDS]

def calculate_tf(tokens: List[str]) -> Dict[str, float]:
    """Calculate term frequencies for a list of tokens."""
    if not tokens:
        return {}
    counts = Counter(tokens)
    length = len(tokens)
    return {word: count / length for word, count in counts.items()}

def calculate_idf(documents: List[List[str]]) -> Dict[str, float]:
    """Calculate inverse document frequencies (IDF) for all unique terms across documents."""
    N = len(documents)
    if N == 0:
        return {}
    
    unique_words: Set[str] = set()
    for doc in documents:
        unique_words.update(doc)
        
    df: Dict[str, int] = {word: 0 for word in unique_words}
    for doc in documents:
        doc_words = set(doc)
        for word in doc_words:
            df[word] += 1
            
    return {word: math.log(1 + (N / count)) for word, count in df.items()}

def compute_tfidf_vector(tf: Dict[str, float], idf: Dict[str, float]) -> Dict[str, float]:
    """Compute TF-IDF weight vector."""
    vector = {}
    for word, tf_val in tf.items():
      idf_val = idf.get(word, 1.0)
      vector[word] = tf_val * idf_val
    return vector

def cosine_similarity(vec1: Dict[str, float], vec2: Dict[str, float]) -> float:
    """Calculate cosine similarity between two sparse weight vectors."""
    all_keys = set(vec1.keys()).union(set(vec2.keys()))
    
    dot_product = sum(vec1.get(key, 0.0) * vec2.get(key, 0.0) for key in all_keys)
    
    magnitude1 = math.sqrt(sum(val ** 2 for val in vec1.values()))
    magnitude2 = math.sqrt(sum(val ** 2 for val in vec2.values()))
    
    if magnitude1 == 0.0 or magnitude2 == 0.0:
      return 0.0
        
    return dot_product / (magnitude1 * magnitude2)

def compute_similarity(query_text: str, document_texts: List[str]) -> List[float]:
    """Given a query and a list of documents, return similarity scores for each document."""
    query_tokens = tokenize(query_text)
    doc_tokens_list = [tokenize(doc) for doc in document_texts]
    
    all_docs = [query_tokens] + doc_tokens_list
    idf = calculate_idf(all_docs)
    
    query_tf = calculate_tf(query_tokens)
    query_vector = compute_tfidf_vector(query_tf, idf)
    
    scores = []
    for doc_tokens in doc_tokens_list:
      doc_tf = calculate_tf(doc_tokens)
      doc_vector = compute_tfidf_vector(doc_tf, idf)
      score = cosine_similarity(query_vector, doc_vector)
      scores.append(score)
        
    return scores
