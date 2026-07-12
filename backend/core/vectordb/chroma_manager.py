import chromadb
from typing import List, Dict, Any, Optional
import os


class ChromaManager:
    _clients = {}
    _collections = {}

    def __init__(self, db_path: str = "./chroma_db", collection_name: str = "documents"):
        """
        Initializes the ChromaDB client and gets or creates the collection.
        
        Args:
            db_path: The directory where ChromaDB will persist its data on disk.
            collection_name: The name of the collection to use.
        """
        # Resolve absolute path to ensure cache hits match exactly
        abs_db_path = os.path.abspath(db_path)
        os.makedirs(abs_db_path, exist_ok=True)
        
        # Instantiate client only once per absolute directory path
        if abs_db_path not in ChromaManager._clients:
            ChromaManager._clients[abs_db_path] = chromadb.PersistentClient(path=abs_db_path)
            
        self.client = ChromaManager._clients[abs_db_path]
        
        # Instantiate/get collection handle only once per client/collection combo
        cache_key = (abs_db_path, collection_name)
        if cache_key not in ChromaManager._collections:
            ChromaManager._collections[cache_key] = self.client.get_or_create_collection(
                name=collection_name,
                metadata={"hnsw:space": "cosine"} 
            )
            print(f"ChromaDB initialized at '{abs_db_path}'. Collection '{collection_name}' ready (initialized).")
        else:
            print(f"ChromaDB client and collection '{collection_name}' retrieved from cache.")
            
        self.collection = ChromaManager._collections[cache_key]
        self.db_path = abs_db_path

    @classmethod
    def clear_collection_cache(cls, db_path: str, collection_name: str):
        """Removes a collection handle from the cache, e.g., when deleted."""
        abs_db_path = os.path.abspath(db_path)
        cache_key = (abs_db_path, collection_name)
        if cache_key in cls._collections:
            del cls._collections[cache_key]
            print(f"Cleared cache for collection '{collection_name}' at '{abs_db_path}'.")

    def insert_embeddings(self, ids: List[str], embeddings: List[List[float]], documents: List[str], metadatas: List[Dict[str, Any]] = None):
        """
        Inserts/updates documents and their pre-calculated embeddings into ChromaDB using upsert.
        
        Args:
            ids: Unique ID string for each document.
            embeddings: The vector embeddings (e.g., from our EmbeddingService).
            documents: The raw text of the documents.
            metadatas: Optional metadata (like categories, titles) for filtering.
        """
        if not ids:
            return
            
        # Use upsert instead of add to gracefully handle existing documents/chunks updates
        self.collection.upsert(
            ids=ids,
            embeddings=embeddings,
            documents=documents,
            metadatas=metadatas
        )
        print(f"Successfully upserted {len(ids)} items into ChromaDB.")

    def query(self, query_embeddings: List[List[float]], n_results: int = 5) -> Dict[str, Any]:
        """
        Queries the database for the most similar documents.
        
        Args:
            query_embeddings: The embeddings of the search queries.
            n_results: Number of top results to return per query.
            
        Returns:
            A dictionary containing the query results (ids, distances, documents, metadatas).
        """
        results = self.collection.query(
            query_embeddings=query_embeddings,
            n_results=n_results
        )
        return results

