"""
Sprint 4 -- Indexing Test Script

Tests:
1. IndexingManager initialization
2. Collection creation and deletion
3. Chunk and embedding indexing
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from core.embeddings.embedding_service import EmbeddingService
from core.rag.indexing import IndexingManager


def main():
    print("=" * 60)
    print("  Sprint 4 -- ChromaDB Indexing Test")
    print("=" * 60)

    # 1. Initialize services
    print("\n[1/4] Initializing indexing manager...")
    db_path = os.path.join(os.path.dirname(__file__), "chroma_db_test_indexing")
    manager = IndexingManager(db_path=db_path)
    embedding_service = EmbeddingService()
    print("   [OK] Services initialized.")

    # 2. Test collection creation
    test_col_name = "temp_test_collection"
    print(f"\n[2/4] Creating collection '{test_col_name}'...")
    success = manager.create_collection(test_col_name)
    assert success, "Failed to create collection"
    
    collections = manager.list_collections()
    col_names = [c["name"] for c in collections]
    print(f"   Collections found: {col_names}")
    assert test_col_name in col_names, "Created collection not found in list"
    print("   [OK] Collection created successfully.")

    # 3. Test indexing chunks
    print("\n[3/4] Indexing chunks into collection...")
    chunks = [
        "ChromaDB is a database built for storing AI embeddings.",
        "RAG structures use database indexing to search for source data."
    ]
    embeddings = embedding_service.generate_batch_embeddings(chunks)

    indexed = manager.index_chunks(
        collection_name=test_col_name,
        chunks=chunks,
        embeddings=embeddings,
        doc_id="doc_test_101",
        doc_name="chroma_features.txt"
    )
    
    assert indexed == 2, f"Expected 2 indexed chunks, got {indexed}"
    
    # Check document count
    updated_cols = manager.list_collections()
    col_info = next(c for c in updated_cols if c["name"] == test_col_name)
    print(f"   Indexed Count in collection: {col_info['document_count']}")
    assert col_info["document_count"] == 2, f"Expected 2 items in database, found {col_info['document_count']}"
    print("   [OK] Chunks indexed successfully.")

    # 4. Test collection deletion
    print(f"\n[4/4] Deleting collection '{test_col_name}'...")
    deleted = manager.delete_collection(test_col_name)
    assert deleted, "Failed to delete collection"
    
    collections_after = manager.list_collections()
    col_names_after = [c["name"] for c in collections_after]
    assert test_col_name not in col_names_after, "Deleted collection still exists"
    print("   [OK] Collection deleted successfully.")

    # Clean up directory
    import shutil
    try:
        if os.path.exists(db_path):
            shutil.rmtree(db_path)
    except PermissionError:
        print(f"   [SKIP] Could not clean up temporary test database due to file lock: {db_path}")

    print("\n" + "=" * 60)
    print("  [PASSED] Sprint 4 Indexing Test")
    print("=" * 60)


if __name__ == "__main__":
    main()
