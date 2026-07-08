# Project Milestones

This document outlines the milestones, sprint structures, and implementation phases of **LLM Playground Studio**.

---

## Phase 1: Generative Foundations & Benchmarking (Sprints 1–6)
This phase focused on establishing model provider clients, basic text tokenizers, embedding visualizers, and benchmarking metrics.

### Sprint 1: Multi-Provider LLM Clients
- **Goal:** Establish client wrappers for Google Gemini, OpenAI, and Anthropic APIs.
- **Deliverables:** Built clients inside `backend/llm/` with fallback logic to support direct HTTP calls for keys with authorization conflicts.
- **Status:** **Completed**.

### Sprint 2: Simulation Sandbox Mode
- **Goal:** Allow testing of the application without active API credentials.
- **Deliverables:** Added a global `Simulation Mode` toggle in the sidebar. This toggle triggers mock responses with randomized latencies to simulate live API calls.
- **Status:** **Completed**.

### Sprint 3: Tokenizer Explorer
- **Goal:** Compare subword tokenizers (BPE, WordPiece, SentencePiece) side-by-side.
- **Deliverables:** Implemented local loaders for `tiktoken`, `bert-base-uncased`, and `t5-small` tokenizers. Built a color-coded subword visualization dashboard.
- **Status:** **Completed**.

### Sprint 4: Embedding Visualizer
- **Goal:** Project high-dimensional vectors onto 2D charts.
- **Deliverables:** Integrated local `SentenceTransformer` vectors with PCA/t-SNE dimensionality reduction and K-Means clustering.
- **Status:** **Completed**.

### Sprint 5: Model Benchmarking
- **Goal:** Measure model speeds and token usage side-by-side.
- **Deliverables:** Implemented concurrent LLM calls to generate comparative analytics (latency distributions, word counts) in a dashboard view.
- **Status:** **Completed**.

### Sprint 6: Telemetry Logs
- **Goal:** Track historical execution logs.
- **Deliverables:** Built in-memory telemetry logs with prefill and reset controls to power the Analytics Dashboard.
- **Status:** **Completed**.

---

## Phase 2: Ingestion & Advanced RAG Pipelines (Sprints 7–10)
This phase added document managers, semantic segmentations, hybrid search indexing, grounded generation, and evaluation dashboards.

### Sprint 7: Document Manager
- **Goal:** Upload and parse raw text documents.
- **Deliverables:** Built parsing pipelines supporting PDF, DOCX, TXT, and MD formats. Saved metadata in `_index.json` to monitor system-wide document stats.
- **Status:** **Completed**.

### Sprint 8: Chunking Explorer
- **Goal:** Compare text segmentation strategies.
- **Deliverables:** Created Fixed-Size, Semantic, and Hierarchical chunking visualizers.
- **Status:** **Completed**.

### Sprint 9: Hybrid Search Indexing
- **Goal:** Combine vector similarity searches with keyword matches.
- **Deliverables:** Implemented BM25 lexical search and local ChromaDB indices, fusing results using the Reciprocal Rank Fusion (RRF) algorithm.
- **Status:** **Completed**.

### Sprint 10: RAG Playground & Evaluation
- **Goal:** Ground LLM responses in retrieved data and calculate performance metrics.
- **Deliverables:** Created the RAG Playground with grounded prompt building and citation cards, and built an Evaluation Dashboard to measure Faithfulness, Relevancy, and Recall scores using LLM judges.
- **Status:** **Completed**.
