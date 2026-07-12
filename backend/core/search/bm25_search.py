from rank_bm25 import BM25Okapi
from typing import List, Dict, Any, Optional
import re


class BM25Search:
    def __init__(self, persist_path: Optional[str] = None):
        """
        Initializes a BM25 keyword search engine.
        BM25 is the industry standard for traditional keyword (lexical) search.
        """
        self.bm25 = None
        self.documents = []
        self.persist_path = persist_path
        if self.persist_path:
            self.load()

    def _tokenize(self, text: str) -> List[str]:
        """
        A simple tokenizer that lowercases and extracts alphanumeric words.
        In production, you would typically remove stop words (the, a, is) and punctuation.
        """
        # Convert to lowercase and find all word boundaries
        return re.findall(r'\b\w+\b', text.lower())

    def save(self):
        if not self.persist_path:
            return
        import pickle
        import os
        try:
            # Ensure folder exists
            dir_name = os.path.dirname(self.persist_path)
            if dir_name:
                os.makedirs(dir_name, exist_ok=True)
            with open(self.persist_path, 'wb') as f:
                pickle.dump(self.documents, f)
            print(f"BM25 index saved successfully to '{self.persist_path}'.")
        except Exception as e:
            print(f"Failed to save BM25 index to '{self.persist_path}': {e}")

    def load(self):
        if not self.persist_path:
            return
        import os
        if os.path.exists(self.persist_path):
            import pickle
            try:
                with open(self.persist_path, 'rb') as f:
                    docs = pickle.load(f)
                    self.documents = docs
                    tokenized_corpus = []
                    for doc in self.documents:
                        title = doc.get("title", "")
                        content = doc.get("content", "")
                        text = f"{title} {content}"
                        tokenized_corpus.append(self._tokenize(text))
                    if tokenized_corpus:
                        self.bm25 = BM25Okapi(tokenized_corpus)
                        print(f"BM25 index loaded successfully from '{self.persist_path}' with {len(self.documents)} items.")
            except Exception as e:
                print(f"Failed to load BM25 index from '{self.persist_path}': {e}")

    def add_documents(self, documents: List[Dict[str, Any]]):
        """
        Tokenizes and indexes a list of documents using the BM25 algorithm.
        
        Args:
            documents: List of document dictionaries containing 'title' and 'content'.
        """
        if not documents:
            return
            
        print(f"Indexing {len(documents)} documents with BM25...")
        
        # Merge new documents with the existing corpus
        self.documents.extend(documents)
        
        tokenized_corpus = []
        for doc in self.documents:
            title = doc.get("title", "")
            content = doc.get("content", "")
            text = f"{title} {content}"
            tokenized_corpus.append(self._tokenize(text))
            
        # Re-initialize the BM25 Okapi model with the complete synchronized corpus
        self.bm25 = BM25Okapi(tokenized_corpus)
        print(f"Documents successfully indexed with BM25. Total size: {len(self.documents)}")
        
        if self.persist_path:
            self.save()

    def search(self, query: str, top_k: int = 5, collection_name: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Searches the BM25 index for the top keyword matches.
        
        Args:
            query: The user's search query string.
            top_k: Number of top results to return.
            collection_name: Optional target collection name to restrict matches.
            
        Returns:
            A list of dictionary results with the original document and BM25 score.
        """
        if not self.bm25 or not self.documents:
            print("Warning: BM25 index is empty.")
            return []
            
        # Filter documents by collection_name if specified
        filtered_indices = []
        filtered_docs = []
        for i, doc in enumerate(self.documents):
            # If doc does not have collection_name, default to matching if no collection was queried
            doc_col = doc.get("collection_name")
            if collection_name is None or doc_col == collection_name:
                filtered_indices.append(i)
                filtered_docs.append(doc)
                
        if not filtered_docs:
            return []
            
        # The query must be tokenized in the exact same way as the documents
        tokenized_query = self._tokenize(query)
        
        # Get raw BM25 scores for every document in the corpus
        doc_scores = self.bm25.get_scores(tokenized_query)
        
        results = []
        for idx, doc in zip(filtered_indices, filtered_docs):
            score = doc_scores[idx]
            # A score > 0 means the document contains at least one of the query keywords
            if score > 0:
                doc_result = doc.copy()
                # Note: BM25 scores are not bound between 0 and 1 like Cosine Similarity.
                # They can be any positive number.
                doc_result['similarity_score'] = float(score) 
                results.append(doc_result)
                
        # Sort by highest score first
        results.sort(key=lambda x: x['similarity_score'], reverse=True)
        
        # Return top K
        return results[:top_k]

