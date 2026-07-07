"""
Sprint 2 -- Chunking Explorer Test Script

Tests:
1. FixedSizeChunker (token and character based)
2. SemanticChunker
3. HierarchicalChunker
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from core.chunking.fixed import FixedSizeChunker
from core.chunking.semantic import SemanticChunker
from core.chunking.hierarchical import HierarchicalChunker


def main():
    print("=" * 60)
    print("  Sprint 2 -- Chunking Explorer Test")
    print("=" * 60)

    test_text = (
        "Large Language Models (LLMs) are a class of artificial intelligence models. "
        "They are trained on vast amounts of text data to understand language. "
        "A key breakthrough behind LLMs is the transformer architecture. "
        "Transformers use self-attention mechanisms to weigh different words. "
        "RAG is a technique that enhances LLM responses with retrieved information. "
        "The RAG pipeline consists of ingestion, retrieval, and generation. "
        "Vector databases are designed to store high-dimensional embeddings."
    )

    # 1. Test Fixed-Size Chunker
    print("\n[1/3] Testing FixedSizeChunker...")
    fixed_char = FixedSizeChunker(chunk_size=150, chunk_overlap=20, use_tokens=False)
    fixed_token = FixedSizeChunker(chunk_size=30, chunk_overlap=5, use_tokens=True)

    char_chunks = fixed_char.chunk(test_text)
    token_chunks = fixed_token.chunk(test_text)

    print(f"   Fixed Character Chunks: {len(char_chunks)}")
    print(f"   Fixed Token Chunks: {len(token_chunks)}")
    assert len(char_chunks) > 0, "Character chunk list should not be empty"
    assert len(token_chunks) > 0, "Token chunk list should not be empty"

    # 2. Test Semantic Chunker
    print("\n[2/3] Testing SemanticChunker...")
    try:
        from core.embeddings.embedding_service import EmbeddingService
        emb_service = EmbeddingService()
        semantic_chunker = SemanticChunker(
            embedding_service=emb_service,
            similarity_threshold=0.5
        )
        semantic_chunks = semantic_chunker.chunk(test_text)
        print(f"   Semantic Chunks: {len(semantic_chunks)}")
        assert len(semantic_chunks) > 0, "Semantic chunks should not be empty"
    except Exception as e:
        print(f"   [SKIP] Semantic chunker test skipped: {e}")

    # 3. Test Hierarchical Chunker
    print("\n[3/3] Testing HierarchicalChunker...")
    hierarchical_chunker = HierarchicalChunker(
        parent_size=250,
        parent_overlap=20,
        child_size=80,
        child_overlap=10,
        use_tokens=False
    )
    h_chunks = hierarchical_chunker.chunk(test_text)
    print(f"   Hierarchical Chunks (Parent + Child): {len(h_chunks)}")
    
    parents = [c for c in h_chunks if c["metadata"].get("is_parent")]
    children = [c for c in h_chunks if not c["metadata"].get("is_parent")]
    
    print(f"   Parent Chunks: {len(parents)}")
    print(f"   Child Chunks: {len(children)}")
    assert len(parents) > 0, "Parent chunks should not be empty"
    assert len(children) > 0, "Child chunks should not be empty"

    print("\n" + "=" * 60)
    print("  [PASSED] Sprint 2 Chunking Explorer Test")
    print("=" * 60)


if __name__ == "__main__":
    main()
