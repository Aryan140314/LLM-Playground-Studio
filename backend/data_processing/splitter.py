"""
Data Processing Splitter Alias

Delegates text segmentation tasks to the fixed size token Chunker.
"""

from typing import List, Dict, Any
from core.chunking.fixed import FixedSizeChunker


class TextSplitter:
    """Delegates splitting commands to FixedSizeChunker."""

    def __init__(self, size: int = 500, overlap: int = 50):
        self.chunker = FixedSizeChunker(chunk_size=size, chunk_overlap=overlap)

    def split(self, text: str, metadata: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        return self.chunker.chunk(text, metadata=metadata)
