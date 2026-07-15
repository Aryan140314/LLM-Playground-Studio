"""
File Utilities

Standardized functions for reading local file sizes, types, and paths.
"""

import os


def get_file_size_kb(filepath: str) -> float:
    """Returns size of a target file path in Kilobytes."""
    try:
        if os.path.exists(filepath):
            return round(os.path.getsize(filepath) / 1024, 2)
    except Exception:
        pass
    return 0.0


def check_allowed_extension(filename: str, allowed: list) -> bool:
    """Validates if file extension matches list of permitted formats."""
    _, ext = os.path.splitext(filename.lower())
    return ext in allowed
