import numpy as np
from typing import List

def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    """
    Calculates the cosine similarity between two vectors.
    
    Cosine similarity measures the angle between two vectors, irrespective of their magnitude.
    A value of 1.0 means they point in exactly the same direction (high similarity).
    A value of 0.0 means they are orthogonal (no similarity).
    A value of -1.0 means they point in opposite directions.
    
    Args:
        vec1: First vector.
        vec2: Second vector.
        
    Returns:
        float: The cosine similarity score (-1.0 to 1.0).
    """
    v1 = np.array(vec1)
    v2 = np.array(vec2)
    
    dot_prod = np.dot(v1, v2)
    norm_v1 = np.linalg.norm(v1)
    norm_v2 = np.linalg.norm(v2)
    
    # Avoid division by zero if a zero vector is passed
    if norm_v1 == 0 or norm_v2 == 0:
        return 0.0
        
    return float(dot_prod / (norm_v1 * norm_v2))

def dot_product(vec1: List[float], vec2: List[float]) -> float:
    """
    Calculates the dot product between two vectors.
    
    Dot product measures both the angle and the magnitude of the vectors.
    If the vectors are normalized (i.e., their length is 1), the dot product 
    is mathematically identical to cosine similarity.
    
    Args:
        vec1: First vector.
        vec2: Second vector.
        
    Returns:
        float: The dot product score.
    """
    v1 = np.array(vec1)
    v2 = np.array(vec2)
    
    return float(np.dot(v1, v2))
