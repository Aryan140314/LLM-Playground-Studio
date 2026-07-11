from typing import List, Dict, Any
from backend.models.document import Document

def clean_and_merge_records(records: List[Dict[str, Any]]) -> List[Document]:
    """
    Cleans raw dictionaries by removing duplicates, stripping extra spaces,
    and merging title and description into a single 'content' field.
    Returns a list of Document objects.
    """
    seen_content = set()
    documents = []
    
    for record in records:
        # 1. Strip spaces from individual fields
        title = record.get("title", "").strip()
        description = record.get("description", "").strip()
        
        # 2. Merge title + description into content
        if title and description:
            # Add a period if title doesn't end with punctuation
            sep = " " if title[-1] in ".!?" else ". "
            raw_content = f"{title}{sep}{description}"
        else:
            raw_content = title or description
            
        # Strip extraneous internal spaces (e.g., double spaces)
        content = " ".join(raw_content.split())
        
        # 3. Remove duplicates
        if content in seen_content or not content:
            continue
        seen_content.add(content)
        
        # Create Document object
        doc = Document(
            id=record["id"],
            title=title,
            content=content,
            category=record.get("category", "Unknown")
        )
        documents.append(doc)
        
    return documents
