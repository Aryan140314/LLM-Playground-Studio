"""
Prompt Engineering Service Wrapper

Integrates zero-shot, few-shot, and chain-of-thought formatting templates.
"""

from core.llm.prompt_manager import PromptManager


class PromptService:
    """Formatter proxy providing prompt builder layouts."""

    @staticmethod
    def get_formatted_prompt(strategy: str, question: str) -> str:
        s = strategy.lower().replace(" ", "_").replace("-", "_")
        if "zero" in s:
            return PromptManager.zero_shot(question)
        elif "few" in s:
            return PromptManager.few_shot(question)
        elif "chain" in s or "cot" in s:
            return PromptManager.chain_of_thought(question)
        return PromptManager.normal(question)
