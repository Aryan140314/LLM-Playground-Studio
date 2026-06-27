"""
Prompt Engineering Templates

This file contains different prompt engineering
strategies used in Prompt Lab.
"""


class PromptTemplates:

    @staticmethod
    def normal(question: str):

        return question

    @staticmethod
    def zero_shot(question: str):

        return f"""
You are a helpful AI assistant.

Explain the following question in simple English.

Question:
{question}
"""

    @staticmethod
    def few_shot(question: str):

        return f"""
Example 1

Question:
What is Artificial Intelligence?

Answer:
Artificial Intelligence is the simulation of human intelligence by machines.

------------------------------------------------------

Example 2

Question:
What is Machine Learning?

Answer:
Machine Learning is a branch of AI that enables computers to learn from data.

------------------------------------------------------

Now answer the following question.

Question:
{question}
"""

    @staticmethod
    def chain_of_thought(question: str):

        return f"""
You are an AI Tutor.

Think carefully.

Explain the answer step by step.

Question:

{question}
"""