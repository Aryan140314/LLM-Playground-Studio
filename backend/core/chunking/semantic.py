"""
Semantic Chunking Strategy

Splits text into chunks based on semantic shifts.
It splits the text into sentences, embeds each sentence,
calculates the similarity between adjacent sentences,
and group sentences together into a chunk until the similarity
drops below a configurable threshold.
"""

import re
from typing import List, Dict, Any, Optional
import numpy as np
from core.embeddings.embedding_service import EmbeddingService


class SemanticChunker:
    """Groups sentences into chunks based on embedding similarity."""

    def __init__(
        self,
        embedding_service: Optional[EmbeddingService] = None,
        similarity_threshold: float = 0.6,
        max_chunk_size: int = 800,
        min_chunk_size: int = 150
    ):
        """
        Args:
            embedding_service: Embedding service to use for sentence vectors.
                               If None, a default instance is created.
            similarity_threshold: Cosine similarity threshold (0.0 to 1.0).
                                  Consecutive sentences with similarity below
                                  this threshold will be split into new chunks.
            max_chunk_size: Force a split if character count exceeds this limit.
            min_chunk_size: Prevent split if current chunk is smaller than this.
        """
        self.embedding_service = embedding_service or EmbeddingService()
        self.similarity_threshold = similarity_threshold
        self.max_chunk_size = max_chunk_size
        self.min_chunk_size = min_chunk_size

    def _split_into_sentences(self, text: str) -> List[str]:
        """Splits raw text into individual sentences using regex."""
        # Simple sentence splitter that handles abbreviations and sentence endings
        sentence_endings = re.compile(r'(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?|!)\s')
        sentences = sentence_endings.split(text)
        return [s.strip() for s in sentences if s.strip()]

    def _cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """Calculates cosine similarity between two vectors."""
        v1, v2 = np.array(vec1), np.array(vec2)
        dot_product = np.dot(v1, v2)
        norm_v1 = np.linalg.norm(v1)
        norm_v2 = np.linalg.norm(v2)
        if norm_v1 == 0 or norm_v2 == 0:
            return 0.0
        return float(dot_product / (norm_v1 * norm_v2))

    def chunk(self, text: str, metadata: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """
        Groups sentences by semantic similarity.

        Returns:
            A list of dictionary chunks with metadata and boundary similarity details.
        """
        base_metadata = metadata or {}
        sentences = self._split_into_sentences(text)
        if not sentences:
            return []

        # If only one sentence, return it as a single chunk
        if len(sentences) == 1:
            return [{
                "chunk_index": 1,
                "text": sentences[0],
                "char_count": len(sentences[0]),
                "word_count": len(sentences[0].split()),
                "metadata": {
                    **base_metadata,
                    "strategy": "semantic",
                    "sentence_count": 1
                }
            }]

        # Generate embeddings for all sentences at once
        embeddings = self.embedding_service.generate_batch_embeddings(sentences)

        # Compute adjacent similarities
        similarities = []
        for i in range(len(sentences) - 1):
            sim = self._cosine_similarity(embeddings[i], embeddings[i + 1])
            similarities.append(sim)

        chunks = []
        current_chunk_sentences = [sentences[0]]
        current_char_count = len(sentences[0])
        chunk_idx = 1

        for i in range(len(sentences) - 1):
            next_sentence = sentences[i + 1]
            next_char_count = len(next_sentence)
            sim = similarities[i]

            # Decide whether to split
            should_split = False

            # Split if similarity is below threshold
            if sim < self.similarity_threshold:
                should_split = True

            # Force split if max size is exceeded
            if current_char_count + next_char_count > self.max_chunk_size:
                should_split = True

            # Do not split if current chunk is too small
            if current_char_count < self.min_chunk_size:
                should_split = False

            if should_split:
                # Save current chunk
                chunk_text = " ".join(current_chunk_sentences)
                chunks.append({
                    "chunk_index": chunk_idx,
                    "text": chunk_text,
                    "char_count": len(chunk_text),
                    "word_count": len(chunk_text.split()),
                    "metadata": {
                        **base_metadata,
                        "strategy": "semantic",
                        "sentence_count": len(current_chunk_sentences),
                        "boundary_similarity": round(sim, 4)
                    }
                })
                chunk_idx += 1
                current_chunk_sentences = [next_sentence]
                current_char_count = next_char_count
            else:
                current_chunk_sentences.append(next_sentence)
                current_char_count += next_char_count + 1  # +1 for spacing

        # Append last chunk
        if current_chunk_sentences:
            chunk_text = " ".join(current_chunk_sentences)
            chunks.append({
                "chunk_index": chunk_idx,
                "text": chunk_text,
                "char_count": len(chunk_text),
                "word_count": len(chunk_text.split()),
                "metadata": {
                    **base_metadata,
                    "strategy": "semantic",
                    "sentence_count": len(current_chunk_sentences),
                    "boundary_similarity": None
                }
            })

        return chunks
