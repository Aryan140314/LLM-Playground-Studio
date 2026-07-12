"""
VectorDB Metadata Schemas

Helper data validation structures for ChromaDB index metadata.
"""

from typing import Dict, Any, Optional


class VectorMetadata:
    """Standardizes dictionary metadata values stored alongside index vectors."""

    @staticmethod
    def construct(
        doc_id: str,
        doc_name: str,
        chunk_index: int,
        strategy: str,
        additional: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Creates unified metadata payload for database insertions."""
        base = {
            "doc_id": doc_id,
            "doc_name": doc_name,
            "chunk_index": chunk_index,
            "strategy": strategy
        }
        if additional:
            base.update(additional)
        return base
