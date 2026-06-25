def zero_shot_prompt(question):

    return question


def few_shot_prompt(question):

    return f"""
Example

Question:
What is AI?

Answer:
Artificial Intelligence is ...

Now answer:

Question:
{question}
"""


def cot_prompt(question):

    return f"""
Think step by step.

Question:

{question}
"""