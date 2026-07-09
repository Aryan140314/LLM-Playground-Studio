"""
Logging Configuration Setup

Standard logger format rules.
"""

import logging.config


def setup_default_logging() -> None:
    """Configures project-wide system log formats."""
    config = {
        'version': 1,
        'disable_existing_loggers': False,
        'formatters': {
            'standard': {
                'format': '%(asctime)s [%(levelname)s] %(name)s: %(message)s'
            },
        },
        'handlers': {
            'console': {
                'class': 'logging.StreamHandler',
                'formatter': 'standard',
                'level': 'INFO',
            },
        },
        'root': {
            'handlers': ['console'],
            'level': 'INFO',
        }
    }
    logging.config.dictConfig(config)
