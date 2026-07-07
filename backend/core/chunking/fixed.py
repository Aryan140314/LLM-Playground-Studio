"""
Fixed-Size Chunking Strategy

Splits text into chunks of a fixed token or character size,
with a configurable overlap between adjacent chunks.
"""

from typing import List, Dict, Any
import tiktoken


class FixedSizeChunker:
    """Splits text into uniform chunks with overlap."""

    def __init__(self, chunk_size: int = 500, chunk_overlap: int = 50, use_tokens: bool = True):
        """
        Args:
            chunk_size: Maximum size of each chunk (characters or tokens).
            chunk_overlap: Overlap size between consecutive chunks.
            use_tokens: If True, uses GPT cl100k_base token counts. Otherwise character counts.
        """
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.use_tokens = use_tokens
        self.encoder = tiktoken.get_encoding("cl100k_base")

    def chunk(self, text: str, metadata: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """
        Splits text into fixed chunks.

        Returns:
            A list of dictionary chunks with text and statistics.
        """
        if not text.strip():
            return []

        if self.use_tokens:
            return self._chunk_by_tokens(text, metadata)
        else:
            return self._chunk_by_characters(text, metadata)

    def _chunk_by_tokens(self, text: str, metadata: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Splits text using tiktoken encoding."""
        tokens = self.encoder.encode(text)
        chunks = []
        start_idx = 0
        chunk_idx = 1

        base_metadata = metadata or {}

        while start_idx < len(tokens):
            end_idx = min(start_idx + self.chunk_size, len(tokens))
            chunk_tokens = tokens[start_idx:end_idx]
            chunk_text = self.encoder.decode(chunk_tokens)

            chunks.append({
                "chunk_index": chunk_idx,
                "text": chunk_text,
                "token_count": len(chunk_tokens),
                "char_count": len(chunk_text),
                "word_count": len(chunk_text.split()),
                "metadata": {
                    **base_metadata,
                    "strategy": "fixed_token",
                    "start_token": start_idx,
                    "end_token": end_idx
                }
            })

            chunk_idx += 1
            # Step forward by chunk_size - chunk_overlap
            step = self.chunk_size - self.chunk_overlap
            if step <= 0:
                step = self.chunk_size  # Avoid infinite loop if overlap >= size
            start_idx += step

        return chunks

    def _chunk_by_characters(self, text: str, metadata: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Splits text using raw character indices."""
        chunks = []
        start_idx = 0
        chunk_idx = 1

        base_metadata = metadata or {}

        while start_idx < len(text):
            end_idx = min(start_idx + self.chunk_size, len(text))
            chunk_text = text[start_idx:end_idx]

            # Estimate token count (roughly 4 chars = 1 token)
            estimated_tokens = len(self.encoder.encode(chunk_text))

            chunks.append({
                "chunk_index": chunk_idx,
                "text": chunk_text,
                "token_count": estimated_tokens,
                "char_count": len(chunk_text),
                "word_count": len(chunk_text.split()),
                "metadata": {
                    **base_metadata,
                    "strategy": "fixed_character",
                    "start_char": start_idx,
                    "end_char": end_idx
                }
            })

            chunk_idx += 1
            step = self.chunk_size - self.chunk_overlap
            if step <= 0:
                step = self.chunk_size
            start_idx += step

        return chunks
