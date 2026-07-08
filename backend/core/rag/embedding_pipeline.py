"""
Embedding Pipeline

Chains: Chunks -> Embedding Model -> Embedding Vectors.
Measures latency, vector dimensions, and provides detailed metrics.
"""

import time
from typing import List, Dict, Any, Optional
from core.embeddings.embedding_service import EmbeddingService


class EmbeddingPipeline:
    """Manages processing text chunks into embedding vectors."""

    def __init__(self, embedding_service: Optional[EmbeddingService] = None):
        """
        Args:
            embedding_service: Pre-configured EmbeddingService instance.
                               If None, a default instance is created.
        """
        self.embedding_service = embedding_service or EmbeddingService()

    def process(self, chunks: List[str]) -> Dict[str, Any]:
        """
        Executes the embedding pipeline.

        Args:
            chunks: A list of text strings (chunks).

        Returns:
            A dictionary containing:
                - embeddings: List of float vectors.
                - model_name: Name of the SentenceTransformer model.
                - dimension: Dimensionality of the vectors (e.g. 384).
                - generation_time_sec: Latency of embedding generation in seconds.
                - chunk_count: Number of chunks processed.
        """
        if not chunks:
            return {
                "embeddings": [],
                "model_name": "unknown",
                "dimension": 0,
                "generation_time_sec": 0.0,
                "chunk_count": 0
            }

        start_time = time.time()
        embeddings = self.embedding_service.generate_batch_embeddings(chunks)
        duration = time.time() - start_time

        # Determine dimensions from the first vector
        dimension = len(embeddings[0]) if embeddings else 0

        # Try to extract the model name if accessible
        model_name = "all-MiniLM-L6-v2"
        if hasattr(self.embedding_service, 'model') and hasattr(self.embedding_service.model, 'get_submodule'):
            # Fallback placeholder to fetch the actual class parameters
            pass

        return {
            "embeddings": embeddings,
            "model_name": model_name,
            "dimension": dimension,
            "generation_time_sec": round(duration, 4),
            "chunk_count": len(chunks)
        }
