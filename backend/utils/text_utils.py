"""
Text Normalization Utilities

Text parsing and character cleanup methods.
"""

import re


def normalize_whitespace(text: str) -> str:
    """Replaces multiple space blocks and tab spaces with single space characters."""
    return re.sub(r'\s+', ' ', text).strip()


def truncate_text(text: str, max_chars: int = 100) -> str:
    """Safely limits a string length, adding trailing ellipses if truncated."""
    if len(text) <= max_chars:
        return text
    return text[:max_chars].strip() + "..."
