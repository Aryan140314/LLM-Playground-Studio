import chromadb
from typing import List, Dict, Any
import os

class ChromaManager:
    def __init__(self, db_path: str = "./chroma_db", collection_name: str = "documents"):
        """
        Initializes the ChromaDB client and gets or creates the collection.
        
        Args:
            db_path: The directory where ChromaDB will persist its data on disk.
            collection_name: The name of the collection to use.
        """
        # Ensure the directory exists
        os.makedirs(db_path, exist_ok=True)
        
        # Initialize Persistent Client (stores data on disk permanently)
        self.client = chromadb.PersistentClient(path=db_path)
        
        # Create or Get the collection
        # We specify hnsw:space = cosine so Chroma uses Cosine Similarity 
        # (just like the mathematical function we built manually in Sprint 3)
        self.collection = self.client.get_or_create_collection(
            name=collection_name,
            metadata={"hnsw:space": "cosine"} 
        )
        print(f"ChromaDB initialized at '{db_path}'. Collection '{collection_name}' ready.")

    def insert_embeddings(self, ids: List[str], embeddings: List[List[float]], documents: List[str], metadatas: List[Dict[str, Any]] = None):
        """
        Inserts documents and their pre-calculated embeddings into ChromaDB.
        
        Args:
            ids: Unique ID string for each document.
            embeddings: The vector embeddings (e.g., from our EmbeddingService).
            documents: The raw text of the documents.
            metadatas: Optional metadata (like categories, titles) for filtering.
        """
        if not ids:
            return
            
        # Add to the collection
        # ChromaDB takes care of storing everything efficiently under the hood
        self.collection.add(
            ids=ids,
            embeddings=embeddings,
            documents=documents,
            metadatas=metadatas
        )
        print(f"Successfully inserted {len(ids)} items into ChromaDB.")

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
