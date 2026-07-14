"""
LLM Service Wrapper

Exposes Gemini and OpenAI client response generators under a unified class interface.
"""

from typing import Dict, Any
from core.llm.gemini_client import GeminiClient
from core.llm.openai_client import OpenAIClient


class LlmService:
    """Dispatches generation instructions to Gemini or OpenAI clients."""

    def __init__(self, provider: str = "gemini"):
        self.provider = provider.lower()
        self.gemini = GeminiClient()
        self.openai = OpenAIClient()

    def generate(self, prompt: str, simulate: bool = False) -> Dict[str, Any]:
        """Directs generation request to selected client model."""
        if self.provider == "openai":
            return self.openai.generate_response(prompt, simulate=simulate)
        return self.gemini.generate_response(prompt, simulate=simulate)
