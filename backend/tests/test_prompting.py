"""
Unit Tests for Prompt Templates

Verifies string prompt format engineering templates.
"""

import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from core.llm.prompt_manager import PromptManager


def test_templates_format():
    q = "What is fine-tuning?"
    zero = PromptManager.zero_shot(q)
    cot = PromptManager.chain_of_thought(q)
    assert q in zero, "Question should be in zero shot prompt text"
    assert q in cot, "Question should be in chain of thought prompt text"
    assert "Think carefully" in cot
