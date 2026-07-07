"""
Hierarchical Chunking Strategy

Splits text into parent-child layers:
1. Large Parent Chunks (for high-level context)
2. Small Child Chunks (for precise embedding matching)
Each child chunk keeps a reference pointer to its parent.
"""

import uuid
from typing import List, Dict, Any
from core.chunking.fixed import FixedSizeChunker


class HierarchicalChunker:
    """Splits text into a hierarchical tree of parent and child chunks."""

    def __init__(
        self,
        parent_size: int = 1000,
        parent_overlap: int = 100,
        child_size: int = 250,
        child_overlap: int = 25,
        use_tokens: bool = False
    ):
        """
        Args:
            parent_size: Chunk size for the parent documents.
            parent_overlap: Overlap for the parent documents.
            child_size: Chunk size for the child documents.
            child_overlap: Overlap for the child documents.
            use_tokens: If True, uses token-based metrics (cl100k_base).
        """
        self.parent_chunker = FixedSizeChunker(
            chunk_size=parent_size,
            chunk_overlap=parent_overlap,
            use_tokens=use_tokens
        )
        self.child_chunker = FixedSizeChunker(
            chunk_size=child_size,
            chunk_overlap=child_overlap,
            use_tokens=use_tokens
        )

    def chunk(self, text: str, metadata: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """
        Performs hierarchical chunking.

        Returns:
            A list containing both parent and child chunks, marked with parent_id links.
        """
        base_metadata = metadata or {}

        # 1. Generate Parent Chunks
        parents = self.parent_chunker.chunk(text, base_metadata)
        all_chunks = []
        global_idx = 1

        for p_idx, parent in enumerate(parents):
            parent_id = f"parent_{uuid.uuid4().hex[:6]}"
            parent_text = parent["text"]

            # Save Parent Chunk
            parent_entry = {
                "chunk_index": global_idx,
                "text": parent_text,
                "token_count": parent["token_count"],
                "char_count": parent["char_count"],
                "word_count": parent["word_count"],
                "metadata": {
                    **parent["metadata"],
                    "strategy": "hierarchical_parent",
                    "parent_id": parent_id,
                    "is_parent": True,
                    "child_count": 0
                }
            }
            all_chunks.append(parent_entry)
            parent_idx_in_list = len(all_chunks) - 1
            global_idx += 1

            # 2. Generate Child Chunks from Parent Text
            children = self.child_chunker.chunk(parent_text)
            parent_entry["metadata"]["child_count"] = len(children)

            for c_idx, child in enumerate(children):
                child_entry = {
                    "chunk_index": global_idx,
                    "text": child["text"],
                    "token_count": child["token_count"],
                    "char_count": child["char_count"],
                    "word_count": child["word_count"],
                    "metadata": {
                        **base_metadata,
                        "strategy": "hierarchical_child",
                        "parent_id": parent_id,
                        "child_id": f"{parent_id}_c{c_idx+1}",
                        "is_parent": False,
                    }
                }
                all_chunks.append(child_entry)
                global_idx += 1

        return all_chunks
