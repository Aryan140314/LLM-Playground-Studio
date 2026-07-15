"""
Unit Tests for Embeddings

Verifies SentenceTransformer vector dimensions.
"""

import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from core.embeddings.embedding_service import EmbeddingService


def test_embedding_dimensions():
    service = EmbeddingService()
    emb = service.generate_embedding("Test prompt vectorization")
    assert len(emb) == 384, "Embedding dimensions should be 384"
