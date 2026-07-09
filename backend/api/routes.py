"""
API Router Aggregator

Binds health, embeddings, llm, and search sub-routers.
"""

from fastapi import APIRouter
from api.health import router as health_router
from api.embeddings import router as embeddings_router
from api.llm import router as llm_router
from api.search import router as search_router

router = APIRouter()

router.include_router(health_router, tags=["health"])
router.include_router(embeddings_router, tags=["embeddings"])
router.include_router(llm_router, tags=["llm"])
router.include_router(search_router, tags=["search"])
