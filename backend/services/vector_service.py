"""
Vector Database Service Wrapper

Exposes ChromaDB client collection storage operations.
"""

from typing import List, Dict, Any
from core.vectordb.chroma_manager import ChromaManager


class VectorService:
    """Wrapper managing insertions and queries on ChromaDB."""

    def __init__(self, chroma_manager: ChromaManager):
        self.manager = chroma_manager

    def insert(self, ids: List[str], embeddings: List[List[float]], documents: List[str], metadatas: List[Dict[str, Any]]) -> None:
        self.manager.insert_embeddings(ids, embeddings, documents, metadatas)

    def query(self, embeddings: List[List[float]], n_results: int = 5) -> Dict[str, Any]:
        return self.manager.query(embeddings, n_results=n_results)
