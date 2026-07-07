"""
Document Metadata & Storage Manager

Manages document metadata, storage, listing, and deletion.
Documents are stored on disk in a dedicated uploads directory.
Metadata is tracked in a JSON index file.
"""

import os
import json
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional


class DocumentManager:
    """
    Manages the lifecycle of uploaded documents:
    - Store uploaded files to disk
    - Track metadata in a JSON index
    - List, retrieve, and delete documents
    - Compute document statistics
    """

    def __init__(self, storage_dir: Optional[str] = None):
        """
        Args:
            storage_dir: Directory where uploaded documents are stored.
                         Defaults to backend/data/uploads/
        """
        if storage_dir is None:
            storage_dir = os.path.join(
                os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
                "data", "uploads"
            )
        self.storage_dir = storage_dir
        os.makedirs(self.storage_dir, exist_ok=True)

        self.index_path = os.path.join(self.storage_dir, "_index.json")
        self._documents = self._load_index()

    def _load_index(self) -> List[Dict[str, Any]]:
        """Loads the document index from disk."""
        if os.path.exists(self.index_path):
            with open(self.index_path, "r", encoding="utf-8") as f:
                return json.load(f)
        return []

    def _save_index(self):
        """Persists the document index to disk."""
        with open(self.index_path, "w", encoding="utf-8") as f:
            json.dump(self._documents, f, indent=2, ensure_ascii=False)

    def add_document(
        self,
        filename: str,
        file_bytes: bytes,
        parsed_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Stores a new document and records its metadata.

        Args:
            filename: Original uploaded filename.
            file_bytes: Raw file content bytes.
            parsed_data: The output from DocumentParser.parse().

        Returns:
            The metadata entry for the new document.
        """
        doc_id = str(uuid.uuid4())[:8]
        ext = os.path.splitext(filename)[1].lower()
        stored_name = f"{doc_id}{ext}"
        stored_path = os.path.join(self.storage_dir, stored_name)

        # Write the raw file to disk
        with open(stored_path, "wb") as f:
            f.write(file_bytes)

        # Build metadata entry
        metadata = {
            "id": doc_id,
            "filename": filename,
            "stored_name": stored_name,
            "file_type": ext.replace(".", "").upper(),
            "file_size_bytes": len(file_bytes),
            "page_count": parsed_data.get("page_count", 0),
            "word_count": parsed_data.get("word_count", 0),
            "char_count": parsed_data.get("char_count", 0),
            "uploaded_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        }

        self._documents.append(metadata)
        self._save_index()
        return metadata

    def list_documents(self) -> List[Dict[str, Any]]:
        """Returns metadata for all stored documents."""
        return self._documents

    def get_document(self, doc_id: str) -> Optional[Dict[str, Any]]:
        """Returns metadata for a specific document by ID."""
        for doc in self._documents:
            if doc["id"] == doc_id:
                return doc
        return None

    def get_document_content(self, doc_id: str) -> Optional[str]:
        """Reads and returns the parsed text content of a document."""
        doc = self.get_document(doc_id)
        if not doc:
            return None

        from core.documents.loader import DocumentLoader
        stored_path = os.path.join(self.storage_dir, doc["stored_name"])
        if not os.path.exists(stored_path):
            return None

        return DocumentLoader.load(stored_path)

    def delete_document(self, doc_id: str) -> bool:
        """
        Deletes a document from storage and index.

        Returns:
            True if deleted, False if not found.
        """
        doc = self.get_document(doc_id)
        if not doc:
            return False

        # Remove file from disk
        stored_path = os.path.join(self.storage_dir, doc["stored_name"])
        if os.path.exists(stored_path):
            os.remove(stored_path)

        # Remove from index
        self._documents = [d for d in self._documents if d["id"] != doc_id]
        self._save_index()
        return True

    def get_statistics(self) -> Dict[str, Any]:
        """Returns aggregate statistics across all documents."""
        total_docs = len(self._documents)
        if total_docs == 0:
            return {
                "total_documents": 0,
                "total_pages": 0,
                "total_words": 0,
                "total_chars": 0,
                "total_size_bytes": 0,
                "file_types": {},
            }

        file_types = {}
        total_pages = 0
        total_words = 0
        total_chars = 0
        total_size = 0

        for doc in self._documents:
            ft = doc.get("file_type", "UNKNOWN")
            file_types[ft] = file_types.get(ft, 0) + 1
            total_pages += doc.get("page_count", 0)
            total_words += doc.get("word_count", 0)
            total_chars += doc.get("char_count", 0)
            total_size += doc.get("file_size_bytes", 0)

        return {
            "total_documents": total_docs,
            "total_pages": total_pages,
            "total_words": total_words,
            "total_chars": total_chars,
            "total_size_bytes": total_size,
            "file_types": file_types,
        }
