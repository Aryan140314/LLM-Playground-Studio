"""
Embedding Cache Service

Caches generated vector calculations in-memory to prevent redundant embedding calculations.
"""

from typing import List, Dict, Optional


class EmbeddingCache:
    """Manages simple in-memory storage for string-to-vector mappings."""

    def __init__(self):
        self._cache: Dict[str, List[float]] = {}

    def get(self, text: str) -> Optional[List[float]]:
        """Retrieve cached vector for a string if exists."""
        return self._cache.get(text)

    def set(self, text: str, embedding: List[float]) -> None:
        """Cache vector mapping for a string."""
        self._cache[text] = embedding

    def clear(self) -> None:
        """Clear cache state."""
        self._cache.clear()

    @property
    def size(self) -> int:
        return len(self._cache)
