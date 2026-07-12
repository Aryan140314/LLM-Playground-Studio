"""
LLM Model Specifications

Defines supported foundation models, pricing, dimensions, and capability metadata.
"""

from typing import List, Dict, Any


SUPPORTED_MODELS: List[Dict[str, Any]] = [
    {
        "id": "gemini-2.5-flash",
        "name": "Gemini 2.5 Flash",
        "provider": "Google",
        "description": "Optimized for high-speed tasks, multimodal reasoning, and efficient text generation.",
        "input_price_per_m": 0.075,
        "output_price_per_m": 0.30,
        "context_window": 1048576,
        "max_output_tokens": 8192
    },
    {
        "id": "gpt-4o-mini",
        "name": "GPT-4o-mini",
        "provider": "OpenAI",
        "description": "OpenAI's fast, lightweight flagship sub-model for cost-effective tasks.",
        "input_price_per_m": 0.150,
        "output_price_per_m": 0.60,
        "context_window": 128000,
        "max_output_tokens": 4096
    },
    {
        "id": "claude-3-5-sonnet",
        "name": "Claude 3.5 Sonnet",
        "provider": "Anthropic",
        "description": "State-of-the-art model for complex logic, high-quality coding, and deep reasoning.",
        "input_price_per_m": 3.00,
        "output_price_per_m": 15.00,
        "context_window": 200000,
        "max_output_tokens": 8192
    }
]


def get_model_spec(model_id: str) -> Dict[str, Any]:
    """Retrieve details for a specific model ID, falling back to Gemini Flash."""
    for model in SUPPORTED_MODELS:
        if model["id"] == model_id:
            return model
    return SUPPORTED_MODELS[0]
