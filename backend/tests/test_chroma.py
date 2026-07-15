"""
Unit Tests for ChromaDB Manager

Verifies connection and collections listing configurations.
"""

import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from core.vectordb.chroma_manager import ChromaManager


def test_chroma_setup():
    db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "chroma_db_api")
    manager = ChromaManager(db_path=db_path, collection_name="test_col")
    assert manager.client is not None, "Chroma DB client should connect"
