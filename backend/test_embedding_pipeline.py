"""
Sprint 3 -- Embedding Pipeline Test Script

Tests:
1. EmbeddingPipeline initialization
2. Batch embedding generation
3. Metric calculations (dimension, generation time)
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from core.embeddings.embedding_service import EmbeddingService
from core.rag.embedding_pipeline import EmbeddingPipeline


def main():
    print("=" * 60)
    print("  Sprint 3 -- Embedding Pipeline Test")
    print("=" * 60)

    # 1. Initialize services
    print("\n[1/3] Initializing services...")
    emb_service = EmbeddingService()
    pipeline = EmbeddingPipeline(embedding_service=emb_service)
    print("   [OK] Services initialized.")

    # 2. Define test chunks
    test_chunks = [
        "First test chunk representing general machine learning concepts.",
        "Second test chunk explaining Retrieval-Augmented Generation.",
        "Third test chunk showing vector database operations with ChromaDB."
    ]

    # 3. Process pipeline
    print(f"\n[2/3] Processing {len(test_chunks)} chunks...")
    result = pipeline.process(test_chunks)

    print(f"   Model Name: {result['model_name']}")
    print(f"   Vector Dimension: {result['dimension']}")
    print(f"   Generation Time: {result['generation_time_sec']} seconds")
    print(f"   Chunk Count: {result['chunk_count']}")

    # 4. Verify assertions
    print("\n[3/3] Verifying response structure...")
    assert result["model_name"] == "all-MiniLM-L6-v2", "Model name should be all-MiniLM-L6-v2"
    assert result["dimension"] == 384, "Dimension of all-MiniLM-L6-v2 should be 384"
    assert result["chunk_count"] == 3, "Chunk count should match input size"
    assert len(result["embeddings"]) == 3, "Should return exactly 3 vectors"
    assert len(result["embeddings"][0]) == 384, "Each vector must have 384 dimensions"
    assert result["generation_time_sec"] >= 0.0, "Generation time must be positive"

    print("   [OK] All assertions passed!")

    print("\n" + "=" * 60)
    print("  [PASSED] Sprint 3 Embedding Pipeline Test")
    print("=" * 60)


if __name__ == "__main__":
    main()
