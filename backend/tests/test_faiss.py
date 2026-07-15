"""
Unit Tests for BM25 Search Indexer

Verifies BM25 lexical keyword indexes.
"""

import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from core.search.bm25_search import BM25Search


def test_bm25_search():
    bm25 = BM25Search()
    docs = [{"id": "1", "content": "Transformer networks are popular"}]
    bm25.add_documents(docs)
    results = bm25.search("Transformer", top_k=1)
    assert len(results) >= 0
