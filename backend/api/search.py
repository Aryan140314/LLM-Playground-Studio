"""
Search API Router

Lexical, semantic, and hybrid search interfaces.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from main import rag_hybrid_search

router = APIRouter()


class SearchPayload(BaseModel):
    query: str
    top_k: int = 5


@router.post("/search/hybrid")
def search_hybrid(payload: SearchPayload):
    try:
        results = rag_hybrid_search.search(payload.query, top_k=payload.top_k)
        return {"status": "success", "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
