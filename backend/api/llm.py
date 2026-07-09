"""
LLM API Router

Prompt dispatch routing interfaces.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from llm.gemini_client import GeminiClient

router = APIRouter()
gemini = GeminiClient()


class PromptPayload(BaseModel):
    prompt: str
    simulate: bool = False


@router.post("/llm/generate")
def execute_generation(payload: PromptPayload):
    try:
        res = gemini.generate_response(payload.prompt, simulate=payload.simulate)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
