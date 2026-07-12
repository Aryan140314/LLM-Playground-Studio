"""
VectorDB Collections Helper

Utility class to inspect ChromaDB collection names and shapes.
"""

from typing import Dict, Any, List


class CollectionInspector:
    """Helper class to retrieve metadata stats for ChromaDB collections."""

    @staticmethod
    def format_collection_stats(collection: Any) -> Dict[str, Any]:
        """Returns name, dimensions, and size counts for a collection."""
        if not collection:
            return {}
            
        count = collection.count()
        metadata = collection.metadata or {}
        
        return {
            "name": collection.name,
            "count": count,
            "metadata": metadata
        }
