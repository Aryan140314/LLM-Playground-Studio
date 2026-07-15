"""
Unit Tests for Hybrid Search Scoring

Verifies RRF ranking calculations.
"""

import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from core.search.ranking import compute_rrf_scores


def test_rrf_scoring():
    rankings = [
        [{"id": "doc1", "content": "Text A"}, {"id": "doc2", "content": "Text B"}],
        [{"id": "doc2", "content": "Text B"}, {"id": "doc1", "content": "Text A"}]
    ]
    fused = compute_rrf_scores(rankings)
    assert len(fused) == 2, "Fused results should have two elements"
    assert "rrf_score" in fused[0], "Result should contain score key"
