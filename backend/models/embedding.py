"""
Embedding Models Schemas

Pydantic schemas validating embedding requests.
"""

from pydantic import BaseModel
from typing import List, Dict, Any


class EmbeddingRequest(BaseModel):
    text: str


class BatchEmbeddingRequest(BaseModel):
    texts: List[str]
