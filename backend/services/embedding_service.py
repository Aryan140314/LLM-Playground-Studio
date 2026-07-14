"""
Embedding Service Wrapper

Exposes the local SentenceTransformer embedding model mappings.
"""

from typing import List
from core.embeddings.embedding_service import EmbeddingService as CoreEmbeddingService


class EmbeddingService:
    """Wrapper mapping client requests to core SentenceTransformer embedding models."""

    def __init__(self, model_name: str = 'all-MiniLM-L6-v2'):
        self.service = CoreEmbeddingService(model_name=model_name)

    def get_embedding(self, text: str) -> List[float]:
        return self.service.generate_embedding(text)

    def get_batch_embeddings(self, texts: List[str]) -> List[List[float]]:
        return self.service.generate_batch_embeddings(texts)
