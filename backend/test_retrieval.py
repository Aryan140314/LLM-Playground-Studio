"""
Sprint 5 -- Retrieval Test Script

Tests:
1. RetrievalService initialization
2. Semantic vector lookup
3. Top-K sorting and score conversion
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from core.embeddings.embedding_service import EmbeddingService
from core.rag.indexing import IndexingManager
from core.rag.retriever import RetrievalService


def main():
    print("=" * 60)
    print("  Sprint 5 -- Vector Retrieval Test")
    print("=" * 60)

    # 1. Initialize services
    print("\n[1/4] Initializing indexing and retrieval manager...")
    db_path = os.path.join(os.path.dirname(__file__), "chroma_db_test_retrieval")
    embedding_service = EmbeddingService()
    indexing_manager = IndexingManager(db_path=db_path)
    retrieval_service = RetrievalService(db_path=db_path, embedding_service=embedding_service)
    print("   [OK] Services initialized.")

    # 2. Setup mock data
    test_col_name = "retrieval_test_col"
    print(f"\n[2/4] Setting up mock collection '{test_col_name}'...")
    indexing_manager.create_collection(test_col_name)

    chunks = [
        "Python is a popular language for software development.",
        "Space exploration is advanced by NASA space shuttles.",
        "Healthy lifestyle includes balanced food choices."
    ]
    embeddings = embedding_service.generate_batch_embeddings(chunks)

    indexing_manager.index_chunks(
        collection_name=test_col_name,
        chunks=chunks,
        embeddings=embeddings,
        doc_id="mock_doc_505",
        doc_name="retrieval_guide.txt"
    )
    print("   [OK] Collection populated.")

    # 3. Query retrieval
    query_text = "NASA rockets and space"
    print(f"\n[3/4] Querying: \"{query_text}\"")
    results = retrieval_service.retrieve(query=query_text, collection_name=test_col_name, top_k=2)

    print(f"   Matches found: {len(results)}")
    for i, res in enumerate(results):
        print(f"      #{i+1} [Sim: {res['similarity']:.4f}] {res['content']}")

    # 4. Verify assertions
    print("\n[4/4] Verifying response structure...")
    assert len(results) == 2, f"Expected 2 matches, got {len(results)}"
    assert "space" in results[0]["content"].lower(), "Top match should be space related"
    assert results[0]["similarity"] > results[1]["similarity"], "Matches must be sorted by similarity"
    assert 0.0 <= results[0]["similarity"] <= 1.0, "Similarity score must be scaled between 0 and 1"
    print("   [OK] All assertions passed!")

    # Clean up collection
    indexing_manager.delete_collection(test_col_name)

    # Clean up database files
    import shutil
    try:
        if os.path.exists(db_path):
            shutil.rmtree(db_path)
    except PermissionError:
        print(f"   [SKIP] Could not clean up temporary database: {db_path}")

    print("\n" + "=" * 60)
    print("  [PASSED] Sprint 5 Retrieval Test")
    print("=" * 60)


if __name__ == "__main__":
    main()
