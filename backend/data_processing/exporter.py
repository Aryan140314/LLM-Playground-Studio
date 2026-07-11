"""
Data Processing Exporter Utility

Utility class that formats list datasets to downloadable JSON file buffers.
"""

import json
from typing import List, Dict, Any


class DataExporter:
    """Serializes dataset list objects to JSON string values."""

    @staticmethod
    def export_to_json(data: List[Dict[str, Any]]) -> str:
        return json.dumps(data, indent=2)
