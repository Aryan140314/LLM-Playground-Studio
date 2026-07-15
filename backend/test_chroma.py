import sys
import os

# Ensure backend directory is in the python path to allow importing core
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from core.vectordb.chroma_manager import ChromaManager
from core.embeddings.embedding_service import EmbeddingService

def main():
    print("--- 1. Initialization ---")
    print("Loading Embedding Service...")
    embedding_service = EmbeddingService()
    
    print("\nInitializing ChromaDB...")
    # We will store the database locally in a folder called 'chroma_db_test'
    db_path = os.path.join(os.path.dirname(__file__), "chroma_db_test")
    chroma = ChromaManager(db_path=db_path)
    
    print("\n--- 2. Prepare Data ---")
    documents = [
        "The quick brown fox jumps over the lazy dog.",
        "A rocket launched into the starry night sky.",
        "Wall Street sees a bullish trend in tech stocks.",
        "The feline rested comfortably on the mat."
    ]
    ids = ["doc1", "doc2", "doc3", "doc4"]
    metadatas = [{"category": "animals"}, {"category": "space"}, {"category": "finance"}, {"category": "animals"}]
    
    print("Generating embeddings for documents...")
    embeddings = embedding_service.generate_batch_embeddings(documents)
    
    print("\n--- 3. Insert into ChromaDB ---")
    chroma.insert_embeddings(ids=ids, embeddings=embeddings, documents=documents, metadatas=metadatas)
    
    print("\n--- 4. Query ChromaDB ---")
    query_text = "space exploration and NASA"
    print(f"Search Query: '{query_text}'")
    
    # We must embed the query before searching
    query_embedding = embedding_service.generate_embedding(query_text)
    
    # Query ChromaDB (passing it as a list of lists, since you can query multiple at once)
    results = chroma.query(query_embeddings=[query_embedding], n_results=2)
    
    print("\nTop 2 Results:")
    # Chroma returns a dictionary of lists of lists. 
    # [0] refers to the first (and only) query we sent.
    for i in range(len(results['ids'][0])):
        doc_id = results['ids'][0][i]
        doc_text = results['documents'][0][i]
        distance = results['distances'][0][i] # In Chroma, 'distance' is used instead of similarity
        metadata = results['metadatas'][0][i]
        
        # Because we configured hnsw:space = cosine, the distance is mathematically (1 - Cosine Similarity)
        # So a distance of 0 means perfect match. We can convert it back to similarity:
        similarity = 1.0 - distance
        
        print(f"  {i+1}. [Similarity: {similarity:.4f}] {doc_text}")
        print(f"     ID: {doc_id} | Metadata: {metadata}")

if __name__ == "__main__":
    main()
