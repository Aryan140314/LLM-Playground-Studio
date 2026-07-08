# Changelog

All notable changes to the **LLM Playground Studio** project are documented here.

---

## [1.1.0] - 2026-07-08

### Added
- **RAG Evaluation Dashboard (Sprint 10):** Measures Faithfulness, Answer Relevancy, and Context Recall scores using LLM judges.
- **Retrieval Comparison Dashboard (Sprint 9):** Benchmarks Naive, Hybrid (RRF), HyDE, and Multi-Query retrieval strategies side-by-side.
- **RAG Playground (Sprint 7 & 8):** End-to-end grounded generation view with citation cards displaying chunk details and source indices.
- **Prompt Builder Engine (Sprint 6):** Combines context chunks, system instructions, and user questions into structured prompts.
- **Local Embedding Ingestion Pipeline:** Batches document chunks, generates embeddings locally using `all-MiniLM-L6-v2`, and writes vectors to ChromaDB and keywords to BM25 indexes.
- **Interactive Chunking Explorer:** Interactive preview of text splitting using Fixed-Size (characters/tokens), Semantic (sentence distance), and Hierarchical chunking strategies.
- **Document Manager:** Uploads PDF, DOCX, TXT, or MD documents, parses content, and tracks file statistics in `_index.json`.

### Fixed
- **Gemini SDK Auth Workaround:** Resolves authorization conflicts with new Google API keys starting with the `AQ.` prefix by automatically falling back to direct REST HTTP calls with the `x-goog-api-key` header.
- **Sidebar Navigation Layout:** Resolves import errors for the `MessageCircle` icon and links all pipeline pages to their respective views.

---

## [1.0.0] - 2026-06-15

### Added
- **Multi-Provider LLM Clients:** Unified interfaces for OpenAI, Anthropic, and Google Gemini APIs.
- **API Simulation Mode:** Bypasses API requests and returns mock responses locally to conserve token quotas.
- **Tokenizer Explorer:** Visualizes text tokenization using BPE, WordPiece, and SentencePiece tokenizers, displaying vocabulary IDs and statistics.
- **Embedding Explorer:** Generates text embeddings and projects them on interactive 2D charts using PCA or t-SNE, with K-Means clustering.
- **Model Comparison Dashboard:** Side-by-side comparison of Gemini, GPT, and Claude models, tracking response time latency and word counts.
- **Analytics Dashboard:** Visualizes latency charts and usage history based on in-memory run history telemetry logs.
