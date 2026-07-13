"""
Base Prompt Templates

Provides foundation templates and configuration schemas for prompt builders.
"""

from typing import Dict, Any


class BasePromptTemplate:
    """Foundational prompt building logic."""

    def __init__(self, template_str: str):
        self.template_str = template_str

    def format(self, **kwargs: Any) -> str:
        """Interpolates variables inside the template string."""
        return self.template_str.format(**kwargs)
