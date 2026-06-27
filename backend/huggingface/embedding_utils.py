from sentence_transformers import SentenceTransformer
import numpy as np

# Global memory cache for loaded models
_MODEL_CACHE = {}

def load_embedding_model(model_name: str = "sentence-transformers/all-MiniLM-L6-v2"):
    """
    Loads and caches a SentenceTransformer model.
    """
    if model_name not in _MODEL_CACHE:
        _MODEL_CACHE[model_name] = SentenceTransformer(model_name)
    return _MODEL_CACHE[model_name]

def generate_embeddings(sentences: list, model_name: str = "sentence-transformers/all-MiniLM-L6-v2") -> np.ndarray:
    """
    Generates dense vector embeddings for a list of sentences using the specified model.
    """
    model = load_embedding_model(model_name)
    # Ensure it handles single string or list input
    if isinstance(sentences, str):
        sentences = [sentences]
    return model.encode(sentences)
