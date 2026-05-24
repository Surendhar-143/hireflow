import math
from typing import List, Dict
from app.embeddings.similarity import tokenize, calculate_tf, calculate_idf, compute_tfidf_vector

class EmbeddingService:
    def generate_document_embedding(self, text: str, corpus: List[str] = None) -> Dict[str, float]:
        """
        Generates a sparse TF-IDF embedding vector (dictionary of word -> weight) for a given text.
        Optionally uses a corpus to compute global IDF weights.
        """
        tokens = tokenize(text)
        if not tokens:
            return {}

        # If a corpus is provided, compute IDF over the entire set of documents
        if corpus:
            all_tokens = [tokenize(doc) for doc in corpus]
            all_docs = [tokens] + all_tokens
            idf = calculate_idf(all_docs)
        else:
            # Fallback to single document IDF (weights everything equally at 1.0 log value)
            idf = {w: 1.0 for w in set(tokens)}

        tf = calculate_tf(tokens)
        return compute_tfidf_vector(tf, idf)

export_service = EmbeddingService()
