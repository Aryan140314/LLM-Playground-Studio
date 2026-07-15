"""
Logger Utilities

Configures logging setups for printing clean CLI messages.
"""

import logging


def get_console_logger(name: str) -> logging.Logger:
    """Configures and retrieves console-mapped log stream."""
    logger = logging.getLogger(name)
    if not logger.handlers:
        handler = logging.StreamHandler()
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
    return logger
