from dataclasses import dataclass

@dataclass
class Document:
    """
    Represents a standard Document object for the system.
    """
    id: int
    title: str
    content: str
    category: str
