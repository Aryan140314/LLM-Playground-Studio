"""
Prompt Manager Service

Maintains templates and instructions for prompt engineering labs.
"""


class PromptManager:
    """Manages prompt engineering templates (Zero-Shot, Few-Shot, Chain-of-Thought)."""

    @staticmethod
    def normal(question: str) -> str:
        return question

    @staticmethod
    def zero_shot(question: str) -> str:
        return (
            "You are a helpful AI assistant.\n\n"
            "Explain the following question in simple English.\n\n"
            f"Question:\n{question}\n"
        )

    @staticmethod
    def few_shot(question: str) -> str:
        return (
            "Example 1\n\n"
            "Question:\nWhat is Artificial Intelligence?\n\n"
            "Answer:\nArtificial Intelligence is the simulation of human intelligence by machines.\n\n"
            "------------------------------------------------------\n\n"
            "Example 2\n\n"
            "Question:\nWhat is Machine Learning?\n\n"
            "Answer:\nMachine Learning is a branch of AI that enables computers to learn from data.\n\n"
            "------------------------------------------------------\n\n"
            "Now answer the following question.\n\n"
            f"Question:\n{question}\n"
        )

    @staticmethod
    def chain_of_thought(question: str) -> str:
        return (
            "You are an AI Tutor.\n\n"
            "Think carefully.\n\n"
            "Explain the answer step by step.\n\n"
            f"Question:\n{question}\n"
        )
