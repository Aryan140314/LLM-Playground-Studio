"""
Execution Timer Utilities

Decorator class that tracks function runtime performance.
"""

import time
import functools
from typing import Callable, Any


def log_execution_time(func: Callable[..., Any]) -> Callable[..., Any]:
    """Decorator printing duration time performance stats for functions."""
    @functools.wraps(func)
    def wrapper(*args: Any, **kwargs: Any) -> Any:
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"[Timer] Function '{func.__name__}' execution took {round(end - start, 4)} seconds.")
        return result
    return wrapper
