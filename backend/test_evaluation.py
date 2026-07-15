"""
Sprint 10 -- RAG Evaluation Dashboard Test Script

Tests:
1. RagEvaluator initialization
2. Factual validation calculations (Faithfulness, Relevancy, Recall)
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from core.rag.evaluation import RagEvaluator


def main():
    print("=" * 60)
    print("  Sprint 10 -- RAG Evaluation Test")
    print("=" * 60)

    # 1. Initialize evaluator
    print("\n[1/3] Initializing RagEvaluator...")
    evaluator = RagEvaluator()
    print("   [OK] Evaluator initialized.")

    # 2. Run calculations
    print("\n[2/3] Executing validation scoring (Simulated)...")
    question = "What is semantic chunking?"
    answer = "Semantic chunking splits text using sentence embeddings to find topics breaks based on Cosine Similarity."
    contexts = [
        {
            "content": "Semantic chunking groups sentences together based on vector similarity breaks."
        }
    ]

    metrics = evaluator.evaluate(
        question=question,
        answer=answer,
        contexts=contexts,
        simulate=True
      )

    print(f"   Faithfulness (Groundedness): {metrics['faithfulness'] * 100}%")
    print(f"   Answer Relevancy: {metrics['relevancy'] * 100}%")
    print(f"   Context Recall: {metrics['recall'] * 100}%")
    print(f"   Overall RAG Quality Score: {metrics['overall_rag_score']}")

    # 3. Assertions
    print("\n[3/3] Verifying metric bounds...")
    assert 0.0 <= metrics["faithfulness"] <= 1.0, "Faithfulness out of bounds"
    assert 0.0 <= metrics["relevancy"] <= 1.0, "Relevancy out of bounds"
    assert 0.0 <= metrics["recall"] <= 1.0, "Recall out of bounds"
    assert 0.0 <= metrics["overall_rag_score"] <= 1.0, "Overall score out of bounds"
    print("   [OK] All metric validation scores in bounds!")

    print("\n" + "=" * 60)
    print("  [PASSED] Sprint 10 RAG Evaluation Test")
    print("=" * 60)


if __name__ == "__main__":
    main()
