"""
Search Service Wrapper

Provides unified access to vector, lexical, and hybrid search engines.
"""

from typing import List, Dict, Any
from core.search.hybrid_search import HybridSearch


class SearchService:
    """Combines semantic search queries and RRF ranking."""

    def __init__(self, hybrid_search: HybridSearch):
        self.hybrid_search = hybrid_search

    def execute_hybrid_search(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        return self.hybrid_search.search(query, top_k=top_k)
