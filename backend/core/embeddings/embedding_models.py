"""
Embedding Models Metadata

Defines the local and API-based embedding models supported by the studio.
"""

from typing import List, Dict, Any

SUPPORTED_EMBEDDING_MODELS: List[Dict[str, Any]] = [
    {
        "id": "all-MiniLM-L6-v2",
        "name": "SentenceTransformer all-MiniLM-L6-v2",
        "provider": "Hugging Face (Local)",
        "dimension": 384,
        "description": "Fast and optimized local text model mapping text to 384-dimensional vector space."
    },
    {
        "id": "text-embedding-3-small",
        "name": "OpenAI text-embedding-3-small",
        "provider": "OpenAI (API)",
        "dimension": 1536,
        "description": "Cost-effective, highly performant API model mapping text to 1536-dimensional space."
    }
]


def get_embedding_model_spec(model_id: str) -> Dict[str, Any]:
    """Retrieve details for a specific embedding model ID."""
    for model in SUPPORTED_EMBEDDING_MODELS:
        if model["id"] == model_id:
            return model
    return SUPPORTED_EMBEDDING_MODELS[0]
