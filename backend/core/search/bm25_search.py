from rank_bm25 import BM25Okapi
from typing import List, Dict, Any
import re

class BM25Search:
    def __init__(self):
        """
        Initializes a BM25 keyword search engine.
        BM25 is the industry standard for traditional keyword (lexical) search.
        """
        self.bm25 = None
        self.documents = []

    def _tokenize(self, text: str) -> List[str]:
        """
        A simple tokenizer that lowercases and extracts alphanumeric words.
        In production, you would typically remove stop words (the, a, is) and punctuation.
        """
        # Convert to lowercase and find all word boundaries
        return re.findall(r'\b\w+\b', text.lower())

    def add_documents(self, documents: List[Dict[str, Any]]):
        """
        Tokenizes and indexes a list of documents using the BM25 algorithm.
        
        Args:
            documents: List of document dictionaries containing 'title' and 'content'.
        """
        if not documents:
            return
            
        print(f"Indexing {len(documents)} documents with BM25...")
        
        tokenized_corpus = []
        for doc in documents:
            title = doc.get("title", "")
            content = doc.get("content", "")
            text = f"{title} {content}"
            
            # BM25 requires the documents to be split into lists of words (tokens)
            tokenized_corpus.append(self._tokenize(text))
            
        # Initialize the BM25 Okapi model with our corpus
        self.bm25 = BM25Okapi(tokenized_corpus)
        self.documents.extend(documents)
        print("Documents successfully indexed with BM25.")

    def search(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """
        Searches the BM25 index for the top keyword matches.
        
        Args:
            query: The user's search query string.
            top_k: Number of top results to return.
            
        Returns:
            A list of dictionary results with the original document and BM25 score.
        """
        if not self.bm25 or not self.documents:
            print("Warning: BM25 index is empty.")
            return []
            
        # The query must be tokenized in the exact same way as the documents
        tokenized_query = self._tokenize(query)
        
        # Get raw BM25 scores for every document in the corpus
        doc_scores = self.bm25.get_scores(tokenized_query)
        
        results = []
        for i, score in enumerate(doc_scores):
            # A score > 0 means the document contains at least one of the query keywords
            if score > 0:
                doc_result = self.documents[i].copy()
                # Note: BM25 scores are not bound between 0 and 1 like Cosine Similarity.
                # They can be any positive number.
                doc_result['similarity_score'] = float(score) 
                results.append(doc_result)
                
        # Sort by highest score first
        results.sort(key=lambda x: x['similarity_score'], reverse=True)
        
        # Return top K
        return results[:top_k]
