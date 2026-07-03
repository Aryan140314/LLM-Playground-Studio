from typing import List, Dict, Any
from core.embeddings.embedding_service import EmbeddingService
from core.embeddings.similarity import cosine_similarity

class SemanticSearch:
    def __init__(self, embedding_service: EmbeddingService):
        """
        Initializes the SemanticSearch engine with an in-memory store.
        
        Args:
            embedding_service: The service used to generate embeddings.
        """
        self.embedding_service = embedding_service
        
        # IN-MEMORY STORAGE (Temporary, before we use ChromaDB)
        self.documents = []  # Stores the original document dictionaries
        self.embeddings = [] # Stores the corresponding 384-dimensional vectors

    def add_documents(self, documents: List[Dict[str, Any]]):
        """
        Embeds a list of documents and stores them in memory.
        
        Args:
            documents: A list of dictionaries containing document data.
        """
        if not documents:
            return
            
        print(f"Embedding {len(documents)} documents for search...")
        
        # Prepare text to embed (combine title and content)
        texts_to_embed = []
        for doc in documents:
            title = doc.get("title", "")
            content = doc.get("content", "")
            # Add a period between title and content if title exists
            text = f"{title}. {content}" if title else content
            texts_to_embed.append(text)
            
        # 1. Generate embeddings in batch for maximum efficiency
        batch_embeddings = self.embedding_service.generate_batch_embeddings(texts_to_embed)
        
        # 2. Store in memory
        self.documents.extend(documents)
        self.embeddings.extend(batch_embeddings)
        print("Documents successfully added to in-memory store.")

    def search(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """
        Searches the in-memory store for documents most similar to the query.
        
        Args:
            query: The user's search query.
            top_k: The number of top results to return (default 5).
            
        Returns:
            A list of the top_k most similar documents.
        """
        if not self.documents:
            print("Warning: Search engine is empty. Please add documents first.")
            return []
            
        # PIPELINE STEP 1: Embed the User Query
        query_embedding = self.embedding_service.generate_embedding(query)
        
        # PIPELINE STEP 2: Compare with ALL documents
        results = []
        for i, doc_embedding in enumerate(self.embeddings):
            # Calculate similarity score using our function from Sprint 3
            score = cosine_similarity(query_embedding, doc_embedding)
            
            # Create a copy of the document so we can attach the score
            doc_result = self.documents[i].copy()
            doc_result["similarity_score"] = score
            results.append(doc_result)
            
        # PIPELINE STEP 3: Sort by similarity score (Highest to Lowest)
        results.sort(key=lambda x: x["similarity_score"], reverse=True)
        
        # PIPELINE STEP 4: Return Top 5 (or top_k)
        return results[:top_k]
