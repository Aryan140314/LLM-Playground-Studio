"""
Chain-of-Thought Prompt Strategy

Forces LLMs to reason step-by-step prior to writing the final conclusion.
"""

from core.prompting.templates import BasePromptTemplate


class ChainOfThoughtPrompt(BasePromptTemplate):
    """Reasoning chain prompt wrapper."""

    def __init__(self):
        super().__init__(
            "You are an AI Tutor.\n\n"
            "Think carefully.\n\n"
            "Explain the answer step by step.\n\n"
            "Question:\n{question}\n"
        )
