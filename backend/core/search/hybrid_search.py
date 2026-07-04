from typing import List, Dict, Any
from core.embeddings.embedding_service import EmbeddingService
from core.vectordb.chroma_manager import ChromaManager
from core.search.bm25_search import BM25Search

class HybridSearch:
    def __init__(self, 
                 embedding_service: EmbeddingService, 
                 chroma_manager: ChromaManager, 
                 bm25_search: BM25Search,
                 rrf_k: int = 60):
        """
        Initializes the Hybrid Search engine.
        Combines Semantic (Vector) Search with Lexical (Keyword) Search.
        
        Args:
            embedding_service: Used to embed queries for ChromaDB.
            chroma_manager: The vector database for semantic search.
            bm25_search: The lexical search engine.
            rrf_k: Constant used in Reciprocal Rank Fusion (default 60 is standard).
        """
        self.embedding_service = embedding_service
        self.chroma_manager = chroma_manager
        self.bm25_search = bm25_search
        self.rrf_k = rrf_k

    def search(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """
        Executes a hybrid search and merges the results.
        
        Args:
            query: The user's search query.
            top_k: Number of final results to return.
            
        Returns:
            A list of dictionary results ranked by hybrid score.
        """
        # We query both engines for slightly more results than top_k 
        # so we have enough data to overlap and fuse accurately.
        search_depth = max(top_k * 2, 10)
        
        # 1. Execute Lexical (BM25) Search
        bm25_results = self.bm25_search.search(query, top_k=search_depth)
        
        # 2. Execute Semantic (ChromaDB) Search
        query_embedding = self.embedding_service.generate_embedding(query)
        chroma_raw = self.chroma_manager.query(query_embeddings=[query_embedding], n_results=search_depth)
        
        # Reformat Chroma results into a clean list of dictionaries
        semantic_results = []
        if chroma_raw['ids'] and chroma_raw['ids'][0]:
            for i in range(len(chroma_raw['ids'][0])):
                doc_id = chroma_raw['ids'][0][i]
                doc_text = chroma_raw['documents'][0][i]
                metadata = chroma_raw['metadatas'][0][i] if chroma_raw['metadatas'] else {}
                
                semantic_results.append({
                    "id": doc_id,
                    "content": doc_text,
                    **metadata
                })
                
        # 3. Reciprocal Rank Fusion (RRF)
        # We cannot simply add BM25 scores and Vector scores together because 
        # BM25 goes from 0 to 100+, and Vectors go from 0 to 1. 
        # RRF fixes this by only looking at the RANK (position 1, 2, 3...)
        # Formula: RRF Score = 1 / (k + rank)
        
        fused_scores = {}
        document_lookup = {}
        
        # Process BM25 Ranks
        for rank, doc in enumerate(bm25_results):
            doc_id = doc.get("id")
            if doc_id not in fused_scores:
                fused_scores[doc_id] = 0.0
                document_lookup[doc_id] = doc
            fused_scores[doc_id] += 1.0 / (self.rrf_k + rank + 1) # rank is 0-indexed, add 1
            
        # Process Semantic Ranks
        for rank, doc in enumerate(semantic_results):
            doc_id = doc.get("id")
            if doc_id not in fused_scores:
                fused_scores[doc_id] = 0.0
                document_lookup[doc_id] = doc
            fused_scores[doc_id] += 1.0 / (self.rrf_k + rank + 1)
            
        # 4. Sort the fused results from highest score to lowest
        sorted_ids = sorted(fused_scores.keys(), key=lambda x: fused_scores[x], reverse=True)
        
        # Build final return list
        final_results = []
        for doc_id in sorted_ids[:top_k]:
            doc = document_lookup[doc_id].copy()
            doc["hybrid_score"] = fused_scores[doc_id]
            final_results.append(doc)
            
        return final_results
