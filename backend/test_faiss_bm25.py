import sys
import os
import time

# Ensure backend directory is in the python path to allow importing core
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from core.embeddings.embedding_service import EmbeddingService
from core.vectordb.chroma_manager import ChromaManager
from core.vectordb.faiss_manager import FaissManager
from core.search.bm25_search import BM25Search

def main():
    print("--- 1. Initialization ---")
    embedding_service = EmbeddingService()
    
    print("Initializing ChromaDB...")
    db_path = os.path.join(os.path.dirname(__file__), "chroma_db_test")
    chroma = ChromaManager(db_path=db_path, collection_name="comparison_test")
    
    print("Initializing FAISS...")
    faiss_mgr = FaissManager(dimension=384)
    
    print("Initializing BM25...")
    bm25 = BM25Search()
    
    print("\n--- 2. Prepare Data ---")
    documents = [
        {"id": "doc1", "title": "", "content": "The quick brown fox jumps over the lazy dog."},
        {"id": "doc2", "title": "", "content": "A rocket launched into the starry night sky for space exploration."},
        {"id": "doc3", "title": "", "content": "Wall Street sees a bullish trend in tech stocks, avoiding falling markets."},
        {"id": "doc4", "title": "", "content": "The feline rested comfortably on the mat."},
        {"id": "doc5", "title": "", "content": "Technology companies report record computer sales."}
    ]
    ids = [doc['id'] for doc in documents]
    raw_texts = [doc['content'] for doc in documents]
    metadatas = [{"category": "general"}] * len(documents)
    
    print("Generating embeddings...")
    embeddings = embedding_service.generate_batch_embeddings(raw_texts)
    
    print("Inserting into databases...")
    chroma.insert_embeddings(ids=ids, embeddings=embeddings, documents=raw_texts, metadatas=metadatas)
    faiss_mgr.insert_embeddings(embeddings=embeddings, documents=documents)
    bm25.add_documents(documents=documents)
    
    print("\n--- 3. Comparison Testing ---")
    # We will test 3 different types of queries
    queries = [
        "space exploration", # Semantic match
        "computer sales",    # Exact keyword match
        "sleeping cat"       # Pure semantic (no matching keywords for "feline rested")
    ]
    
    for query in queries:
        print(f"\n=========================================")
        print(f"Search Query: '{query}'")
        print(f"=========================================")
        
        # Generate the query embedding once for the vector databases
        q_emb = embedding_service.generate_embedding(query)
        
        # A) ChromaDB (Vector Search)
        t0 = time.time()
        c_res = chroma.query(query_embeddings=[q_emb], n_results=1)
        t_chroma = time.time() - t0
        
        # B) FAISS (Vector Search)
        t0 = time.time()
        f_res = faiss_mgr.query(query_embedding=q_emb, n_results=1)
        t_faiss = time.time() - t0
        
        # C) BM25 (Keyword Search)
        t0 = time.time()
        b_res = bm25.search(query=query, top_k=1)
        t_bm25 = time.time() - t0
        
        print(f"\n[ChromaDB] (took {t_chroma*1000:.2f}ms)")
        if c_res['documents'][0]:
            print(f"  -> {c_res['documents'][0][0]}")
            
        print(f"\n[FAISS] (took {t_faiss*1000:.2f}ms)")
        if f_res:
            print(f"  -> {f_res[0]['content']} (Cosine Score: {f_res[0]['similarity_score']:.4f})")
            
        print(f"\n[BM25] (took {t_bm25*1000:.2f}ms)")
        if b_res:
            print(f"  -> {b_res[0]['content']} (BM25 Score: {b_res[0]['similarity_score']:.4f})")
        else:
            print("  -> No exact keyword match found!")

if __name__ == "__main__":
    main()
