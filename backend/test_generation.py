"""
Sprint 7 -- Grounded Generation Test Script

Tests:
1. RagGenerator initialization
2. Naive RAG prompt-to-response generation
3. Metric telemetry (words, tokens, latency)
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from core.rag.generation import RagGenerator


def main():
    print("=" * 60)
    print("  Sprint 7 -- RAG Generation Test")
    print("=" * 60)

    # 1. Initialize RAG generator
    print("\n[1/3] Initializing RagGenerator...")
    generator = RagGenerator()
    print("   [OK] Service initialized.")

    # 2. Setup mock query & contexts
    question = "How does BPE handle out-of-vocabulary terms?"
    contexts = [
        {
            "id": "doc1_ch2",
            "content": "BPE (Byte-Pair Encoding) handles unknown terms by decomposing them into base subword tokens.",
            "similarity": 0.8541,
            "metadata": {
                "doc_name": "tokenizer_guide.pdf",
                "chunk_index": 2
            }
        }
    ]

    # 3. Test Naive RAG (Simulated)
    print("\n[2/3] Executing Naive RAG Generation (Simulated)...")
    res = generator.generate_naive_rag(
        question=question,
        contexts=contexts,
        system_instructions="Answer strictly using context.",
        simulate=True
    )

    print(f"   Success Status: {res['success']}")
    print(f"   Model: {res['model']}")
    print(f"   Latency: {res['response_time']}s")
    print(f"   Token Count: {res['token_count']}")
    print(f"   Grounded Output Answer:")
    print(f"   >>> {res['answer'][:150]}...")

    # 4. Verify assertions
    print("\n[3/3] Validating schema values...")
    assert res["success"] is True, "RAG request should report success"
    assert "Gemini" in res["model"], "Model metadata missing"
    assert res["token_count"] > 0, "Token count should be computed"
    assert len(res["answer"]) > 0, "Grounded response cannot be empty"
    assert "System Instructions:" in res["full_prompt"], "Prompt format mismatch"
    print("   [OK] All schemas validated!")

    print("\n" + "=" * 60)
    print("  [PASSED] Sprint 7 Grounded Generation Test")
    print("=" * 60)


if __name__ == "__main__":
    main()
