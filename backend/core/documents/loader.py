"""
Document Loader

Handles reading raw file content from uploaded documents.
Supports: PDF, DOCX, TXT, Markdown
"""

import os
from typing import Optional
from PyPDF2 import PdfReader
from docx import Document as DocxDocument


class DocumentLoader:
    """Loads raw text content from various file formats."""

    SUPPORTED_EXTENSIONS = {".pdf", ".docx", ".txt", ".md"}

    @staticmethod
    def load(file_path: str) -> str:
        """
        Reads a file and returns its text content.

        Args:
            file_path: Absolute path to the file.

        Returns:
            The extracted text content as a string.

        Raises:
            ValueError: If the file format is not supported.
            FileNotFoundError: If the file does not exist.
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")

        ext = os.path.splitext(file_path)[1].lower()

        if ext not in DocumentLoader.SUPPORTED_EXTENSIONS:
            raise ValueError(f"Unsupported file format: {ext}. Supported: {DocumentLoader.SUPPORTED_EXTENSIONS}")

        if ext == ".pdf":
            return DocumentLoader._load_pdf(file_path)
        elif ext == ".docx":
            return DocumentLoader._load_docx(file_path)
        elif ext in (".txt", ".md"):
            return DocumentLoader._load_text(file_path)

    @staticmethod
    def _load_pdf(file_path: str) -> str:
        """Extracts text from all pages of a PDF file."""
        reader = PdfReader(file_path)
        pages = []
        for page in reader.pages:
            text = page.extract_text()
            if text:
                pages.append(text.strip())
        return "\n\n".join(pages)

    @staticmethod
    def _load_docx(file_path: str) -> str:
        """Extracts text from all paragraphs of a DOCX file."""
        doc = DocxDocument(file_path)
        paragraphs = []
        for para in doc.paragraphs:
            if para.text.strip():
                paragraphs.append(para.text.strip())
        return "\n\n".join(paragraphs)

    @staticmethod
    def _load_text(file_path: str) -> str:
        """Reads plain text or markdown files."""
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()

    @staticmethod
    def load_from_bytes(file_bytes: bytes, filename: str) -> str:
        """
        Loads text from raw bytes (used for API file uploads).

        Args:
            file_bytes: The raw file content.
            filename: Original filename to determine format.

        Returns:
            Extracted text content.
        """
        import tempfile
        ext = os.path.splitext(filename)[1].lower()

        if ext not in DocumentLoader.SUPPORTED_EXTENSIONS:
            raise ValueError(f"Unsupported file format: {ext}")

        # Write to temp file and read
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
            tmp.write(file_bytes)
            tmp_path = tmp.name

        try:
            return DocumentLoader.load(tmp_path)
        finally:
            os.unlink(tmp_path)
