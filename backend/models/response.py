"""
Response Schemas

Standardized Pydantic schemas validating client response wrappers.
"""

from pydantic import BaseModel
from typing import Any, Dict, Optional


class ApiResponse(BaseModel):
    status: str = "success"
    message: Optional[str] = None
    data: Optional[Dict[str, Any]] = None
