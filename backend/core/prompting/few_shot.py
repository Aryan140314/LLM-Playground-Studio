"""
Few-Shot Prompt Strategy

Structures questions with prior example pairs to guide target model responses.
"""

from core.prompting.templates import BasePromptTemplate


class FewShotPrompt(BasePromptTemplate):
    """Examples-guided Few-Shot prompt wrapper."""

    def __init__(self):
        super().__init__(
            "Example 1\n\n"
            "Question:\nWhat is Artificial Intelligence?\n\n"
            "Answer:\nArtificial Intelligence is the simulation of human intelligence by machines.\n\n"
            "------------------------------------------------------\n\n"
            "Example 2\n\n"
            "Question:\nWhat is Machine Learning?\n\n"
            "Answer:\nMachine Learning is a branch of AI that enables computers to learn from data.\n\n"
            "------------------------------------------------------\n\n"
            "Now answer the following question.\n\n"
            "Question:\n{question}\n"
        )
