"""
Grounded Generation (RAG) Service

Coordinates prompt building and LLM client query execution.
Provides grounded generation answers.
"""

from typing import List, Dict, Any, Optional
from core.rag.prompt_builder import PromptBuilder
from llm.gemini_client import GeminiClient


class RagGenerator:
    """Orchestrates grounded RAG generation using prompt builder and LLM client."""

    def __init__(self, prompt_builder: Optional[PromptBuilder] = None, gemini_client: Optional[GeminiClient] = None):
        self.prompt_builder = prompt_builder or PromptBuilder()
        self.gemini_client = gemini_client or GeminiClient()

    def generate_naive_rag(
        self,
        question: str,
        contexts: List[Dict[str, Any]],
        system_instructions: Optional[str] = None,
        simulate: bool = False
    ) -> Dict[str, Any]:
        """
        Executes Naive RAG: builds prompt from retrieved contexts and queries LLM.

        Args:
            question: User question.
            contexts: List of retrieved context chunks.
            system_instructions: Optional system instructions prompt.
            simulate: If True, uses mock response to save API quota.

        Returns:
            A dictionary containing LLM generated response text, full prompt sent, and stats.
        """
        # 1. Build Grounded Prompt
        prompt_data = self.prompt_builder.build_prompt(
            question=question,
            contexts=contexts,
            system_instructions=system_instructions
        )
        full_prompt = prompt_data["full_prompt"]

        # 2. Execute Generation via Gemini
        res = self.gemini_client.generate_response(full_prompt, simulate=simulate)

        return {
            "success": res["success"],
            "model": res["model"],
            "answer": res["text"],
            "full_prompt": full_prompt,
            "response_time": res["response_time"],
            "word_count": res["word_count"],
            "char_count": res["character_count"],
            "character_count": res["character_count"],
            "token_count": prompt_data["token_count"]
        }

