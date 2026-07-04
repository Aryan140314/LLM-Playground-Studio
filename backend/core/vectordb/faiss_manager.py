import faiss
import numpy as np
from typing import List, Dict, Any

class FaissManager:
    def __init__(self, dimension: int = 384):
        """
        Initializes a FAISS index for high-speed vector search.
        
        Args:
            dimension: The size of the embeddings (384 for all-MiniLM-L6-v2).
        """
        self.dimension = dimension
        
        # IndexFlatIP uses Inner Product. 
        # To calculate Cosine Similarity with FAISS, we normalize the vectors 
        # to length 1 and then take the inner product.
        self.index = faiss.IndexFlatIP(dimension)
        
        # FAISS ONLY stores vectors, not the text data itself (unlike ChromaDB).
        # We must maintain our own list to map the integer ID returned by FAISS 
        # back to the actual document text.
        self.documents = []

    def insert_embeddings(self, embeddings: List[List[float]], documents: List[Dict[str, Any]]):
        """
        Inserts embeddings into the FAISS index.
        
        Args:
            embeddings: The list of vectors.
            documents: The corresponding document metadata/text.
        """
        if not embeddings:
            return
            
        # FAISS strictly requires float32 numpy arrays
        vectors = np.array(embeddings).astype('float32')
        
        # Normalize vectors so Inner Product == Cosine Similarity
        faiss.normalize_L2(vectors)
        
        # Add to the FAISS index
        self.index.add(vectors)
        
        # Save documents in python memory to map back later
        self.documents.extend(documents)
        print(f"Successfully inserted {len(documents)} items into FAISS.")

    def query(self, query_embedding: List[float], n_results: int = 5) -> List[Dict[str, Any]]:
        """
        Queries the FAISS index for the most similar documents.
        
        Args:
            query_embedding: A single query vector.
            n_results: Number of results to return.
            
        Returns:
            A list of dictionary results with the original document and score.
        """
        # Convert query to numpy and normalize
        q_vec = np.array([query_embedding]).astype('float32')
        faiss.normalize_L2(q_vec)
        
        # Search the index
        # D is a matrix of distances (scores), I is a matrix of document indices
        D, I = self.index.search(q_vec, n_results)
        
        results = []
        # We only sent 1 query, so we look at the first row [0]
        for score, doc_idx in zip(D[0], I[0]):
            # FAISS returns -1 if there aren't enough documents in the index
            if doc_idx != -1 and doc_idx < len(self.documents):
                doc_result = self.documents[doc_idx].copy()
                doc_result['similarity_score'] = float(score)
                results.append(doc_result)
                
        return results
