# Project Architecture

Welcome to the architectural documentation for **LLM Playground Studio**, a comprehensive educational and benchmarking suite designed to dissect, explore, and analyze the mechanics of Large Language Models (LLMs) and advanced search retrieval architectures.

---

## 1. Project Overview
LLM Playground Studio is an interactive dashboard environment built for developers, educators, and AI engineers. It demonstrates the inner workings of natural language processing pipelines, starting from subword tokenization and high-dimensional vector embeddings, to lexical search indexing, vector store management, hybrid search ranking fusion, and multi-strategy RAG (Retrieval-Augmented Generation) architectures.

---

## 2. Architecture Goals
- **Decoupled Mechanics:** Isolate heavy ML workloads and vector management (FastAPI) from UI controls (Next.js).
- **Transparency & Education:** Expose pipeline telemetry metrics (token mappings, coordinates, similarities, performance overheads) to the user interface.
- **Quota Conservation (Simulation Mode):** Provide high-fidelity simulated response modes for rate-limited API endpoints (like Google Gemini Free Tier).
- **Modular Adaptability:** Architect decoupled core packages to easily swap indexing engines (ChromaDB), prompt templates, and models.

---

## 3. High-Level Architecture

The application adopts a classic decoupled client-server architecture:

```mermaid
graph TD
    subgraph Client ["Frontend (Next.js Application)"]
        UI[Tailwind React UI] --> |State Management| Context[Theme & Simulation Contexts]
        UI --> |API Requests| FetchClient[Fetch Service API Wrapper]
    end

    subgraph Server ["Backend (FastAPI Application)"]
        API[FastAPI Endpoints /api/*] --> CORSMiddleware[CORS Middleware]
        API --> CoreRouting[FastAPI Routing Manager]
        
        subgraph CoreServices ["Core ML & RAG Package Services"]
            Tokenizers[Tokenizer Utils: tiktoken, SentencePiece]
            Embeddings[Embedding Service: SentenceTransformer]
            Search[BM25 Lexical + Hybrid Search]
            VectorStore[ChromaDB Manager]
            RAG[Retrieval-Augmented Generation Suite]
            Eval[LLM Judge Evaluation Suite]
        end
        
        CoreRouting --> CoreServices
        CoreServices --> LocalStorage[(Local Disk Storage)]
    end

    FetchClient <--> |REST HTTP Requests / JSON Response| API
```

---

## 4. Modules & Directory Structures

The workspace is organized into discrete client and server projects:

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

## 5. Design Patterns
1. **Facade Pattern:** Wrapper services (e.g., `LlmService`, `EmbeddingService`) wrap complex core computations and offer a simple interface.
2. **Strategy Pattern:** The chunking module uses different strategies (`FixedSizeChunker`, `SemanticChunker`, `HierarchicalChunker`) conforming to a common contract.
3. **Registry Pattern:** Models are registered within standard metadata schemas (`SUPPORTED_EMBEDDING_MODELS`) to make updates straightforward.
4. **Fallback Pattern:** The `GeminiClient` switches to direct REST HTTP requests if the `google-genai` SDK encounters authorization token bugs with new Google keys.

---

## 6. Dependency Graph

The dependencies of core services form a logical pipeline:

```mermaid
graph TD
    Loader[core.documents.loader] --> Parser[core.documents.parser]
    Parser --> Chunker[core.chunking]
    Chunker --> EmbedPipeline[core.rag.embedding_pipeline]
    EmbedPipeline --> Indexer[core.rag.indexing]
    Indexer --> Chroma[core.vectordb.chroma_manager]
    Chroma --> Retriever[core.rag.retriever]
    Retriever --> PromptBuilder[core.rag.prompt_builder]
    PromptBuilder --> RagGen[core.rag.generation]
    RagGen --> Evaluator[core.rag.evaluation]
```

---

## 7. Request & Response Lifecycle

Here is the step-by-step path a client request takes through the system (e.g., executing a grounded RAG generation query):

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

## 8. Future Scalability
- **Database Scaling:** The current setup relies on local disk storage (`ChromaDB`). Scaling this would involve migrating to cloud vector databases like Pinecone, Milvus, or Qdrant.
- **Asynchronous Processing:** Long-running tasks like document ingestion can be offloaded to Celery or Redis queues to prevent server blocking.
- **User Authentication:** Not implemented in the current repository. This is a recommended improvement for production deployments.
