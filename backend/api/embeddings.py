"""
Embeddings API Router

Vectorization query interfaces.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from core.embeddings.embedding_service import EmbeddingService

router = APIRouter()
emb_service = EmbeddingService()


class TextPayload(BaseModel):
    texts: List[str]


@router.post("/embeddings/generate")
def generate_batch(payload: TextPayload):
    try:
        vectors = emb_service.generate_batch_embeddings(payload.texts)
        return {"status": "success", "embeddings": vectors}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
