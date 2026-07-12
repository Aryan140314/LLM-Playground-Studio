"""
Embedding Utility Functions

Mathematical helper utilities for manipulating high-dimensional float vectors.
"""

import math
from typing import List


def l2_normalize(vector: List[float]) -> List[float]:
    """Applies L2 normalization to a vector to make its length exactly 1.0."""
    sq_sum = sum(v ** 2 for v in vector)
    norm = math.sqrt(sq_sum)
    if norm == 0:
        return vector
    return [v / norm for v in vector]


def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    """Calculates cosine similarity (-1.0 to 1.0) between two float lists."""
    if len(v1) != len(v2) or not v1:
        return 0.0
        
    dot_product = sum(a * b for a, b in zip(v1, v2))
    norm_a = math.sqrt(sum(a ** 2 for a in v1))
    norm_b = math.sqrt(sum(b ** 2 for b in v2))
    
    if norm_a == 0 or norm_b == 0:
        return 0.0
        
    return dot_product / (norm_a * norm_b)
