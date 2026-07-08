"""
Retrieval Service

Converts a user's natural language question into an embedding vector,
queries a target ChromaDB collection, and returns the top-K semantically similar chunks.
"""

import time
from typing import List, Dict, Any, Optional
from core.embeddings.embedding_service import EmbeddingService
from core.vectordb.chroma_manager import ChromaManager


class RetrievalService:
    """Manages document chunk retrieval using vector search."""

    def __init__(self, db_path: str = "./chroma_db_api", embedding_service: Optional[EmbeddingService] = None):
        """
        Args:
            db_path: Path to the persistent ChromaDB database.
            embedding_service: EmbeddingService to embed search queries.
        """
        self.db_path = db_path
        self.embedding_service = embedding_service or EmbeddingService()

    def retrieve(self, query: str, collection_name: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """
        Retrieves top_k chunks semantically related to the query.

        Args:
            query: User's question or search phrase.
            collection_name: The database collection to search.
            top_k: Number of results to return.

        Returns:
            A list of dictionary objects representing matched chunks.
        """
        if not query.strip():
            return []

        # 1. Embed query
        query_embedding = self.embedding_service.generate_embedding(query)

        # 2. Initialize Chroma manager for collection
        manager = ChromaManager(db_path=self.db_path, collection_name=collection_name)

        # 3. Query collection
        raw_results = manager.query(query_embeddings=[query_embedding], n_results=top_k)

        # 4. Format results
        formatted_results = []
        if raw_results["ids"] and raw_results["ids"][0]:
            for i in range(len(raw_results["ids"][0])):
                doc_id = raw_results["ids"][0][i]
                content = raw_results["documents"][0][i]
                distance = raw_results["distances"][0][i]
                metadata = raw_results["metadatas"][0][i] if raw_results["metadatas"] else {}

                # Cosine distance to similarity: 1.0 - distance
                similarity = 1.0 - distance

                formatted_results.append({
                    "id": doc_id,
                    "content": content,
                    "similarity": round(similarity, 4),
                    "metadata": metadata
                })

        return formatted_results
