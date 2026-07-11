"""
Data Processing Parser Alias

Exposes document cleaning and page parsing features.
"""

from typing import Dict, Any
from core.documents.parser import DocumentParser


class FileParser:
    """Delegates parsing structure parsing queries to DocumentParser."""

    @staticmethod
    def parse_file(raw_text: str, filename: str) -> Dict[str, Any]:
        return DocumentParser.parse(raw_text, filename)
