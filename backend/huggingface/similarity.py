from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

def cosine_scores(vectors: np.ndarray) -> np.ndarray:
    """
    Calculates pairwise cosine similarity scores for a set of vectors.
    """
    return cosine_similarity(vectors)

def query_similarity(query_vector: np.ndarray, vectors: np.ndarray) -> np.ndarray:
    """
    Calculates the cosine similarity between a query vector and a set of document vectors.
    Returns a 1D array of scores.
    """
    # Reshape vectors if they are 1D to keep them 2D for scikit-learn
    if query_vector.ndim == 1:
        query_vector = query_vector.reshape(1, -1)
    if vectors.ndim == 1:
        vectors = vectors.reshape(1, -1)
        
    return cosine_similarity(query_vector, vectors)[0]
