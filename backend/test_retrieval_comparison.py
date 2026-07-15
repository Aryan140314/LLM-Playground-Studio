"""
Sprint 9 -- Retrieval Comparison Test Script

Tests:
1. RetrievalComparer initialization
2. Side-by-side run of Naive, Hybrid, HyDE, and Multi-Query strategies
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from core.rag.retrieval_comparison import RetrievalComparer
from main import retrieval_service, rag_hybrid_search


def main():
    print("=" * 60)
    print("  Sprint 9 -- Retrieval Comparison Test")
    print("=" * 60)

    # 1. Initialize comparer
    print("\n[1/3] Initializing RetrievalComparer...")
    comparer = RetrievalComparer(
        retrieval_service=retrieval_service,
        hybrid_search=rag_hybrid_search
    )
    print("   [OK] Comparer initialized.")

    # 2. Run comparisons
    print("\n[2/3] Executing comparison runs (Simulated)...")
    query = "How does tokenization work?"
    col_name = "master_collection"

    naive_res = comparer.run_naive(query, col_name, top_k=2)
    hybrid_res = comparer.run_hybrid(query, top_k=2)
    hyde_res = comparer.run_hyde(query, col_name, top_k=2, simulate=True)
    mq_res = comparer.run_multiquery(query, col_name, top_k=2, simulate=True)

    print(f"   Naive Matches Count: {len(naive_res)}")
    print(f"   Hybrid Matches Count: {len(hybrid_res)}")
    print(f"   HyDE Hypothetical Doc length: {len(hyde_res['hypothetical_doc'])}")
    print(f"   Multi-Query variation strings: {len(mq_res['queries_generated'])}")

    # 3. Assertions
    print("\n[3/3] Validating comparison structures...")
    assert isinstance(naive_res, list), "Naive result should be list"
    assert isinstance(hybrid_res, list), "Hybrid result should be list"
    assert "hypothetical_doc" in hyde_res, "HyDE response format mismatch"
    assert "queries_generated" in mq_res, "Multi-query response format mismatch"
    print("   [OK] All structures validated!")

    print("\n" + "=" * 60)
    print("  [PASSED] Sprint 9 Retrieval Comparison Test")
    print("=" * 60)


if __name__ == "__main__":
    main()
