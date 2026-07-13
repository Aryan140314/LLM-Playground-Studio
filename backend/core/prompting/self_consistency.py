"""
Self-Consistency Prompt Strategy

Generates multiple diverse reasoning pathways and returns the most common answer.
"""

from core.prompting.templates import BasePromptTemplate


class SelfConsistencyPrompt(BasePromptTemplate):
    """Self-consistency prompt wrapper."""

    def __init__(self):
        super().__init__(
            "You are an AI Analyst.\n\n"
            "Generate 3 distinct reasoning paths to solve this question, then state your final consensus answer.\n\n"
            "Question:\n{question}\n"
        )
