"""
Document Parser

Parses loaded text into structured document objects with
page-level segmentation and content cleaning.
"""

import re
from typing import List, Dict, Any


class DocumentParser:
    """Parses raw text into structured document objects."""

    @staticmethod
    def parse(raw_text: str, filename: str) -> Dict[str, Any]:
        """
        Parses raw text into a structured document object.

        Args:
            raw_text: The full text content of the document.
            filename: Original filename for reference.

        Returns:
            A structured document dictionary with pages and content.
        """
        # Clean the text
        cleaned = DocumentParser._clean_text(raw_text)

        # Split into pages (by double newlines as page separators)
        pages = DocumentParser._split_into_pages(cleaned)

        return {
            "filename": filename,
            "content": cleaned,
            "pages": pages,
            "page_count": len(pages),
            "word_count": len(cleaned.split()),
            "char_count": len(cleaned),
        }

    @staticmethod
    def _clean_text(text: str) -> str:
        """Cleans raw text by normalizing whitespace and removing artifacts."""
        # Replace multiple spaces with single space
        text = re.sub(r' +', ' ', text)
        # Replace 3+ newlines with 2
        text = re.sub(r'\n{3,}', '\n\n', text)
        # Strip leading/trailing whitespace from each line
        lines = [line.strip() for line in text.split('\n')]
        return '\n'.join(lines).strip()

    @staticmethod
    def _split_into_pages(text: str) -> List[Dict[str, Any]]:
        """
        Splits text into logical pages.
        Uses double-newline separators as page boundaries.
        """
        # Split on double newlines (paragraph boundaries)
        raw_sections = text.split('\n\n')

        pages = []
        current_page = []
        current_word_count = 0
        page_num = 1
        target_words_per_page = 300  # Approximate words per page

        for section in raw_sections:
            section = section.strip()
            if not section:
                continue

            section_words = len(section.split())
            current_page.append(section)
            current_word_count += section_words

            # Start new page if we exceed target
            if current_word_count >= target_words_per_page:
                page_content = '\n\n'.join(current_page)
                pages.append({
                    "page_number": page_num,
                    "content": page_content,
                    "word_count": current_word_count,
                    "char_count": len(page_content),
                })
                page_num += 1
                current_page = []
                current_word_count = 0

        # Don't forget the last page
        if current_page:
            page_content = '\n\n'.join(current_page)
            pages.append({
                "page_number": page_num,
                "content": page_content,
                "word_count": current_word_count,
                "char_count": len(page_content),
            })

        return pages
