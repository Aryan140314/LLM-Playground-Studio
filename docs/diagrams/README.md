# Architecture & Workflow Diagrams

This directory contains the Mermaid source code and explanations for the primary diagrams of **LLM Playground Studio**. Since PNG generation is not possible in this terminal environment, use these Mermaid definitions to render the diagrams using tools like [Mermaid Live Editor](https://mermaid.live) or a Markdown preview extension.

---

## 1. High-Level Architecture (`architecture.png`)
Shows the decoupled structure between the React frontend and the FastAPI backend service.

```mermaid
graph TD
    subgraph Client ["Client Interface (Next.js)"]
        UI[Tailwind React UI Dashboard]
        Context[Global State Contexts]
        Fetch[REST API Fetch Client]
        UI <--> Context
        UI --> Fetch
    end

    subgraph Server ["Backend API (FastAPI)"]
        API[FastAPI Router Endpoints]
        Core[Core Logic Packages]
        DB[Local Storage & Database Manager]
        API --> Core
        Core --> DB
    end

    Fetch <--> |REST HTTP Requests / JSON Response| API
```

---

## 2. Ingestion & Retrieval Dataflow (`dataflow.png`)
Traces the flow of data through document parsing, chunking, indexing, and retrieval.

```mermaid
flowchart TD
    File[Upload Document: PDF/DOCX/TXT/MD] --> Parse[1. Parser Extracts Clean Text]
    Parse --> Chunk[2. Chunker Splits into Segments]
    
    Chunk --> Embed[3. Embedding Pipeline Generates 384-d Vectors]
    Embed --> Index[4. Indexing Manager Writes Indexes]
    
    Index --> Chroma[(ChromaDB Vector Store)]
    Index --> BM25[(BM25 Lexical Index)]
    
    Query[User Natural Language Search Query] --> VectorQuery[5. Generate Query Embedding]
    Query --> TokenQuery[6. Tokenize Search Keywords]
    
    VectorQuery --> Chroma
    TokenQuery --> BM25
    
    Chroma --> |Semantic Similarity Matches| RRF[7. Reciprocal Rank Fusion]
    BM25 --> |Lexical Matches| RRF
    
    RRF --> FinalResults[8. Rank & Return Combined Top-K]
```

---

## 3. RAG Grounded Generation Sequence (`sequence.png`)
Illustrates the chronological sequence of requests and responses when executing a grounded RAG generation query.

```mermaid
sequenceDiagram
    autonumber
    actor User as Client Dashboard
    participant API as FastAPI Router
    participant Service as RagGenerator
    participant Ret as RetrievalService
    participant DB as ChromaManager
    participant LLM as GeminiClient
    participant Store as Local Storage

    User->>API: POST /api/rag/generation {question, collection, simulate}
    API->>Service: generate_naive_rag()
    Service->>Ret: retrieve(question, collection)
    Ret->>DB: query(query_embedding)
    DB->>Store: Read vector indices from disk
    Store-->>DB: Return document chunks & scores
    DB-->>Ret: Raw matching records
    Ret-->>Service: Formatted context list
    Service->>LLM: generate_response(constructed_grounded_prompt)
    Note over LLM: Evaluates credentials & formats payload
    LLM-->>Service: Generated text answer
    Service-->>API: Grounded JSON response model
    API-->>User: Rendered answer & Citations UI
```

---

## 4. Server Deployment Diagram (`deployment.png`)
Shows the recommended production hosting structure with Nginx routing traffic to the frontend and backend services.

```mermaid
graph TD
    Client[User Browser Client] -->|HTTP Port 80| Nginx[Nginx Reverse Proxy]
    
    subgraph VM ["Virtual Private Server (Ubuntu VM)"]
        Nginx -->|Route to localhost:3000| Frontend[Next.js Production Build]
        Nginx -->|Route to localhost:8000/api| Backend[FastAPI Server via Uvicorn]
        
        subgraph LocalStorage ["Local Persistent Disk"]
            Backend -->|Read/Write Vectors| ChromaDB[(ChromaDB Folders)]
            Backend -->|Read/Write Uploads| UploadsFolder[(Parsed Uploads Directory)]
        end
    end
```

---

## 5. Folder Structure Diagram (`folder_structure.png`)
Visualizes the layout of folders and files in the repository.

```
LLM-Playground-Studio/
├── backend/                       # Python Backend Service
│   ├── api/                       # Modular FastAPI Routes
│   ├── config/                    # Logging, constants, and API key environment configurations
│   ├── core/                      # Core ML engines and pipelines
│   │   ├── chunking/              # Text splitting strategies (fixed, semantic, hierarchical)
│   │   ├── documents/             # Document parsing, loading, and metadata tracking
│   │   ├── embeddings/            # SentenceTransformer embeddings and distance metrics
│   │   ├── llm/                   # Multi-provider client interfaces (Gemini, Claude, GPT)
│   │   ├── prompting/             # Prompt engineering strategies (Zero-Shot, Few-Shot, CoT)
│   │   ├── rag/                   # Retrieval-Augmented Generation, HyDE, Multi-Query, and Eval
│   │   ├── search/                # BM25 Lexical search and RRF fusion ranking
│   │   └── vectordb/              # ChromaDB index collection handlers
│   ├── data/                      # Local raw storage and parsed uploads
│   ├── models/                    # Pydantic schemas validating payload contracts
│   ├── services/                  # Business logic wrapper services
│   ├── tests/                     # Pytest testing suites
│   ├── utils/                     # Timer decorators, text normalizers, and console loggers
│   └── main.py                    # Server startup file registering routers & global states
├── frontend/                      # React Next.js App
│   ├── src/
│   │   ├── app/                   # App Router views & dashboard pages
│   │   ├── components/            # Shared UI components (Charts, Tables, Modals)
│   │   ├── context/               # Global states (Theme, Simulation Mode toggle)
│   │   ├── services/              # HTTP client API wrappers
│   │   └── styles/                # CSS Style Sheets
```

---

## 6. Component Interaction Diagram (`component_diagram.png`)
Shows the connections between the backend classes and managers.

```mermaid
classDiagram
    class DocumentLoader {
        +load(file_path: str) str
        +load_from_bytes(file_bytes: bytes, filename: str) str
    }
    class DocumentParser {
        +parse(text: str, filename: str) dict
    }
    class DocumentManager {
        +add_document(filename: str, bytes: bytes, parsed: dict) dict
        +list_documents() list
        +get_document_content(doc_id: str) str
    }
    class FixedSizeChunker {
        +chunk(text: str) list
    }
    class SemanticChunker {
        +chunk(text: str) list
    }
    class HierarchicalChunker {
        +chunk(text: str) list
    }
    class EmbeddingService {
        +generate_embedding(text: str) list
        +generate_batch_embeddings(texts: list) list
    }
    class ChromaManager {
        +insert_embeddings(ids: list, embeddings: list, docs: list)
        +query(query_embeddings: list) dict
    }
    class BM25Search {
        +add_documents(documents: list)
        +search(query: str) list
    }
    class HybridSearch {
        +search(query: str) list
    }

    DocumentLoader --> DocumentParser
    DocumentParser --> DocumentManager
    DocumentManager --> FixedSizeChunker
    DocumentManager --> SemanticChunker
    DocumentManager --> HierarchicalChunker
    FixedSizeChunker --> EmbeddingService
    SemanticChunker --> EmbeddingService
    HierarchicalChunker --> EmbeddingService
    EmbeddingService --> ChromaManager
    ChromaManager --> HybridSearch
    BM25Search --> HybridSearch
```
