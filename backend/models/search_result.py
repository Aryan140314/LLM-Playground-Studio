"""
Search Result Schemas

Pydantic schemas validating query match records.
"""

from pydantic import BaseModel
from typing import Dict, Any, List


class SearchRecord(BaseModel):
    id: str
    content: str
    similarity: float
    metadata: Dict[str, Any]


class QueryResponse(BaseModel):
    status: str
    results: List[SearchRecord]
