"""
Reciprocal Rank Fusion (RRF) Ranking

Fuses search rank results from multiple retrieval strategies.
"""

from typing import List, Dict, Any


def compute_rrf_scores(
    rankings: List[List[Dict[str, Any]]],
    k: int = 60
) -> List[Dict[str, Any]]:
    """
    Computes reciprocal rank scores across multiple list structures.
    Formula: score = sum(1 / (k + rank))
    """
    scores: Dict[str, float] = {}
    item_map: Dict[str, Dict[str, Any]] = {}

    for rank_list in rankings:
        for idx, item in enumerate(rank_list):
            item_id = item.get("id") or str(item.get("content", ""))
            if not item_id:
                continue
                
            rank = idx + 1
            scores[item_id] = scores.get(item_id, 0.0) + (1.0 / (k + rank))
            
            if item_id not in item_map:
                item_map[item_id] = item

    # Sort items by highest RRF score
    sorted_ids = sorted(scores.keys(), key=lambda x: scores[x], reverse=True)
    
    final_results = []
    for uid in sorted_ids:
        item = item_map[uid].copy()
        item["rrf_score"] = scores[uid]
        final_results.append(item)
        
    return final_results
