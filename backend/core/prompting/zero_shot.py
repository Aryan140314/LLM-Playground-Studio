"""
Zero-Shot Prompt Strategy

Structures a direct question with task context without offering example matches.
"""

from core.prompting.templates import BasePromptTemplate


class ZeroShotPrompt(BasePromptTemplate):
    """Direct Zero-Shot prompt wrapper."""

    def __init__(self):
        super().__init__(
            "You are a helpful AI assistant.\n\n"
            "Explain the following question in simple English.\n\n"
            "Question:\n{question}\n"
        )
