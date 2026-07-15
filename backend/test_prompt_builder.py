"""
Sprint 6 -- Prompt Builder Test Script

Tests:
1. PromptBuilder initialization
2. Context grounding formatting
3. Prompt tokenization metrics (tiktoken)
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from core.rag.prompt_builder import PromptBuilder


def main():
    print("=" * 60)
    print("  Sprint 6 -- Prompt Builder Test")
    print("=" * 60)

    # 1. Initialize prompt builder
    print("\n[1/3] Initializing PromptBuilder...")
    builder = PromptBuilder()
    print("   [OK] Service initialized.")

    # 2. Setup mock question & contexts
    question = "How does BPE tokenization handle out-of-vocabulary words?"
    contexts = [
        {
            "id": "doc1_ch2",
            "content": "Byte-Pair Encoding (BPE) handles unknown words by breaking them down into subwords or characters.",
            "similarity": 0.8541,
            "metadata": {
                "doc_name": "tokenizer_guide.pdf",
                "chunk_index": 2
            }
        },
        {
            "id": "doc1_ch5",
            "content": "Vocabulary size in BPE is predefined. Any characters not in the base vocabulary are mapped to unk tokens.",
            "similarity": 0.6124,
            "metadata": {
                "doc_name": "tokenizer_guide.pdf",
                "chunk_index": 5
            }
        }
    ]

    # 3. Construct prompt
    print("\n[2/3] Constructing grounded prompt...")
    system_ins = "Answer based only on the provided tokenizer context. If not present, say I do not know."
    result = builder.build_prompt(
        question=question,
        contexts=contexts,
        system_instructions=system_ins
    )

    print(f"   Character Count: {result['char_count']}")
    print(f"   Word Count: {result['word_count']}")
    print(f"   Token Count (cl100k_base): {result['token_count']}")

    print("\nGrounded Prompt Preview:")
    print("-" * 45)
    print(result["full_prompt"][:400] + "\n...")
    print("-" * 45)

    # 4. Verify assertions
    print("\n[3/3] Verifying structures...")
    assert result["char_count"] > 0, "Character count must be positive"
    assert result["word_count"] > 0, "Word count must be positive"
    assert result["token_count"] > 0, "Token count must be positive"
    assert "tokenizer_guide.pdf" in result["full_prompt"], "Source document metadata missing from prompt"
    assert "unk tokens" in result["full_prompt"], "Grounded context text missing from prompt"
    assert system_ins in result["full_prompt"], "System instructions missing from prompt"
    
    print("   [OK] All assertions passed!")

    print("\n" + "=" * 60)
    print("  [PASSED] Sprint 6 Prompt Builder Test")
    print("=" * 60)


if __name__ == "__main__":
    main()
