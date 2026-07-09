"""
Health API Endpoint

Provides backend health checks.
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
def get_health_status():
    """Returns online status verification."""
    return {"status": "healthy", "service": "llm-playground-studio-api"}
