"""
Data Processing Metadata Alias

Binds parsed documents index metrics.
"""

from typing import Dict, Any
from core.documents.metadata import DocumentManager


class DocMetadataTracker:
    """Delegates CRUD index registrations to DocumentManager."""

    def __init__(self):
        self.manager = DocumentManager()

    def get_document_stats(self) -> Dict[str, Any]:
        return self.manager.get_overall_stats()
