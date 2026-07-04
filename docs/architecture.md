# Project Architecture

The **LLM Playground Studio** is a full-stack Generative AI application designed to demonstrate, benchmark, and utilize advanced search architectures (Semantic, Keyword, and Hybrid) culminating in a Retrieval-Augmented Generation (RAG) pipeline.

## High-Level Architecture

The system is decoupled into two primary layers: a modern React frontend and a high-performance Python backend.

### 1. Frontend (Next.js)
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **Components:** React functional components with state management (React Hooks).
- **Core Views:** Sidebar navigation connecting various AI modules (Search Explorer, Prompt Lab, Tokenizer).
- **Network Layer:** Standard `fetch` API wrappers (`utils/api.ts`) to communicate with the Python backend.

### 2. Backend API (FastAPI)
- **Framework:** FastAPI
- **Web Server:** Uvicorn
- **API Routes:** RESTful endpoints (`/api/search`, `/api/chroma`, `/api/hybrid`, `/api/insert`) handling frontend requests and returning validated JSON responses via Pydantic models.

### 3. Core AI Services (Python)
The backend delegates complex operations to modular AI services:
- **EmbeddingService:** Uses `sentence-transformers` (`all-MiniLM-L6-v2`) to convert text into 384-dimensional mathematical vectors.
- **BM25Search:** Uses `rank_bm25` to perform lightning-fast lexical (keyword) analysis and scoring.
- **ChromaManager:** A persistent local vector database (`chromadb`) that stores embeddings and performs cosine-similarity semantic searches.
- **HybridSearch:** An orchestrator that queries both ChromaDB and BM25 simultaneously, fusing the results using the Reciprocal Rank Fusion (RRF) mathematical formula.
- **LLMService (Upcoming):** Will connect to external LLM providers (Gemini, OpenAI, Claude) to generate human-like answers based on search results.

## Storage
- **Vector Storage:** Local disk-based ChromaDB (`chroma_db_api/`).
- **Raw Data:** JSON/CSV datasets stored in `data/` awaiting batch ingestion.
