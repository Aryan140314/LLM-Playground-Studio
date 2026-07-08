# Project Roadmap

This roadmap outlines the milestones, features, and future plans for **LLM Playground Studio**, based on the current state of the codebase.

---

## 1. Completed Features

### Phase 1: Generative AI Foundations & Benchmarking
- **Modular Client wrappers:** Unified interfaces for OpenAI, Anthropic, and Google Gemini APIs.
- **API Simulation Mode:** Bypasses API requests and returns mock responses locally to conserve token quotas.
- **Tokenizer Explorer:** Visualizes text tokenization using BPE, WordPiece, and SentencePiece tokenizers, displaying vocabulary IDs and statistics.
- **Embedding Explorer:** Generates text embeddings and projects them on interactive 2D charts using PCA or t-SNE, with K-Means clustering.
- **Model Comparison Dashboard:** Side-by-side comparison of Gemini, GPT, and Claude models, tracking response time latency and word counts.
- **Analytics Dashboard:** Visualizes latency charts and usage history based on in-memory run history telemetry logs.

### Phase 2: Ingestion & In-depth RAG Pipeline
- **Document Manager:** Uploads PDF, DOCX, TXT, or MD documents, parses content, and tracks file statistics in `_index.json`.
- **Chunking Explorer:** Interactive preview of text splitting using Fixed-Size (characters/tokens), Semantic (sentence distance), and Hierarchical chunking strategies.
- **Embedding & Indexing Pipelines:** Batches document chunks, generates embeddings locally using `all-MiniLM-L6-v2`, and writes vectors to ChromaDB and keywords to BM25 indexes.
- **Hybrid Search Engine:** Integrates vector semantic search and BM25 lexical search using the Reciprocal Rank Fusion (RRF) algorithm.
- **Retrieval Comparison Dashboard:** Renders retrieved chunks from Naive, Hybrid, HyDE, and Multi-Query strategies side-by-side for comparison.
- **Grounded Prompt Builder:** Formats system instructions, contexts, and user questions into structured prompts.
- **RAG Playground:** End-to-end grounded generation view with citation cards displaying chunk details and source indices.
- **Evaluation Dashboard:** Calculates Faithfulness, Answer Relevancy, and Context Recall scores using LLM judges.

---

## 2. In Progress / Validation Phase
- **Edge-Case Validation:** Verifying parsing and chunking reliability on large files like the Meta AI RAG paper.
- **Unit Test Coverage:** Expanding backend tests using pytest (`backend/tests/`).

---

## 3. Future Roadmap

These features are planned to make the repository production-ready:

- **Asynchronous Task Queue:** Offload heavy document ingestion and embedding generation workloads to Celery and Redis to avoid server blocking.
- **User Authentication:** Add JWT-based auth flows to secure endpoints.
- **Local Database Persistence for Conversations:** Implement a SQLite database to save user chat histories and configurations.
- **Docker Deployment Configurations:** Create `Dockerfile` and `docker-compose.yml` templates to simplify deployment setup.

---

## 4. Nice-to-Have Features

- **Cross-Encoder Re-ranking:** Add a local model-based re-ranking step (using a Cross-Encoder model) to improve context retrieval accuracy.
- **Vector-to-Document Highlighting:** Clicking a citation card opens the source document viewer and highlights the matching chunk text.
- **Multimodal Document Ingestion:** Support parsing tables and images within PDF documents using OCR models.
