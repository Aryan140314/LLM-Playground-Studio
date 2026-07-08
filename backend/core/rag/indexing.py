"""
Indexing Manager

Manages ChromaDB collections and document indexing operations.
Provides statistics on collection sizes and metadata.
"""

from typing import List, Dict, Any, Optional
import chromadb
from core.vectordb.chroma_manager import ChromaManager


class IndexingManager:
    """Orchestrates indexing documents and managing collections."""

    def __init__(self, db_path: str = "./chroma_db_api"):
        """
        Args:
            db_path: Path to the persistent ChromaDB storage.
        """
        self.db_path = db_path
        self.client = chromadb.PersistentClient(path=db_path)

    def list_collections(self) -> List[Dict[str, Any]]:
        """
        Lists all collections in ChromaDB with their document count.

        Returns:
            A list of dictionary objects containing name and count.
        """
        collections = self.client.list_collections()
        result = []
        for col in collections:
            result.append({
                "name": col.name,
                "document_count": col.count(),
                "metadata": col.metadata or {}
            })
        return result

    def create_collection(self, name: str) -> bool:
        """
        Creates a new collection in ChromaDB.

        Args:
            name: The collection name.

        Returns:
            True if created, False if already exists.
        """
        try:
            self.client.create_collection(
                name=name,
                metadata={"hnsw:space": "cosine"}
            )
            return True
        except Exception:
            return False

    def delete_collection(self, name: str) -> bool:
        """
        Deletes a collection from ChromaDB.

        Args:
            name: The collection name.

        Returns:
            True if deleted, False if not found.
        """
        try:
            self.client.delete_collection(name=name)
            return True
        except Exception:
            return False

    def index_chunks(
        self,
        collection_name: str,
        chunks: List[str],
        embeddings: List[List[float]],
        doc_id: str,
        doc_name: str
    ) -> int:
        """
        Indexes a list of chunks and embeddings into a specific collection.

        Args:
            collection_name: Target collection.
            chunks: List of text chunk strings.
            embeddings: Corresponding embedding vectors.
            doc_id: Associated document ID.
            doc_name: Associated document filename.

        Returns:
            The number of chunks indexed.
        """
        if not chunks or not embeddings or len(chunks) != len(embeddings):
            return 0

        # Use ChromaManager to get/create and insert
        manager = ChromaManager(db_path=self.db_path, collection_name=collection_name)
        
        # Build unique IDs and metadata for each chunk
        ids = [f"{doc_id}_ch{i+1}" for i in range(len(chunks))]
        metadatas = [{
            "doc_id": doc_id,
            "doc_name": doc_name,
            "chunk_index": i + 1
        } for i in range(len(chunks))]

        manager.insert_embeddings(
            ids=ids,
            embeddings=embeddings,
            documents=chunks,
            metadatas=metadatas
        )

        return len(chunks)
