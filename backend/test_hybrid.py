import sys
import os

# Ensure backend directory is in the python path to allow importing core
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from core.embeddings.embedding_service import EmbeddingService
from core.vectordb.chroma_manager import ChromaManager
from core.search.bm25_search import BM25Search
from core.search.hybrid_search import HybridSearch

def main():
    print("--- 1. Initialization ---")
    embedding_service = EmbeddingService()
    
    # We use a fresh collection for this test
    db_path = os.path.join(os.path.dirname(__file__), "chroma_db_test")
    chroma = ChromaManager(db_path=db_path, collection_name="hybrid_test_final")
    
    bm25 = BM25Search()
    
    # Initialize our new Hybrid Search Engine
    hybrid = HybridSearch(embedding_service, chroma, bm25)
    
    print("\n--- 2. Prepare Tricky Data ---")
    documents = [
        # Document 1: Has exact keyword "Apple" but is about the fruit.
        {"id": "doc1", "title": "", "content": "I bought a juicy red apple at the farmers market today."},
        # Document 2: Has semantic meaning of tech company, but doesn't say "Apple".
        {"id": "doc2", "title": "", "content": "The Cupertino-based tech giant released its latest smartphone with a titanium body."},
        # Document 3: Has BOTH keyword and semantic meaning.
        {"id": "doc3", "title": "", "content": "Apple announced record profits from iPhone sales this quarter."},
    ]
    ids = [doc['id'] for doc in documents]
    raw_texts = [doc['content'] for doc in documents]
    
    print("Generating embeddings & Indexing...")
    embeddings = embedding_service.generate_batch_embeddings(raw_texts)
    
    chroma.insert_embeddings(ids=ids, embeddings=embeddings, documents=raw_texts, metadatas=[{"tag": "test"}]*len(documents))
    bm25.add_documents(documents=documents)
    
    print("\n--- 3. Hybrid Search Test ---")
    # This query tests both algorithms
    query = "Apple technology company"
    print(f"Search Query: '{query}'")
    
    print("\n[BM25 ONLY (Keyword)]")
    # BM25 will rank Doc 1 and Doc 3 because they contain the word "Apple"
    for r in bm25.search(query, top_k=3):
        print(f"  -> [{r.get('similarity_score', 0):.4f}] {r['content']}")
        
    print("\n[ChromaDB ONLY (Semantic)]")
    # Chroma will rank Doc 2 and Doc 3 because they semantically mean "tech company"
    q_emb = embedding_service.generate_embedding(query)
    c_res = chroma.query(query_embeddings=[q_emb], n_results=3)
    for i in range(len(c_res['ids'][0])):
        dist = c_res['distances'][0][i]
        text = c_res['documents'][0][i]
        print(f"  -> [{1-dist:.4f}] {text}")

    print("\n[HYBRID SEARCH (Merged RRF)]")
    # Hybrid should pull Doc 3 to the absolute top since it wins in BOTH domains!
    h_res = hybrid.search(query, top_k=3)
    for r in h_res:
        print(f"  -> [{r.get('hybrid_score', 0):.4f}] {r['content']}")

if __name__ == "__main__":
    main()
