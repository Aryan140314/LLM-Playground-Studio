"""
Metadata Filters

Implements pre-filtering and post-filtering conditions for search retrieval queries.
"""

from typing import List, Dict, Any


def apply_metadata_filter(results: List[Dict[str, Any]], filter_criteria: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Filters search results based on key-value metadata criteria."""
    if not filter_criteria:
        return results
        
    filtered = []
    for r in results:
        match = True
        for k, v in filter_criteria.items():
            # Check root level keys and nested metadata keys
            r_val = r.get(k) or r.get("metadata", {}).get(k)
            if r_val != v:
                match = False
                break
        if match:
            filtered.append(r)
            
    return filtered
