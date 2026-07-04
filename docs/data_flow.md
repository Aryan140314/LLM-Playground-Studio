# Data Flow Architecture

This document maps out how data moves through the LLM Playground Studio system during different phases of operation.

## Phase 1: Data Ingestion (Batch)
Before searching can occur, raw data must be indexed.
1. **Source Data:** A massive JSON file (`processed_documents.json`) containing documents.
2. **Parsing & Splitting:** The data is read into memory and chunked into smaller, semantically meaningful text strings.
3. **Parallel Indexing:**
   - **Branch A (Vector):** The strings are passed to `EmbeddingService`, converted into 384-dimensional vectors, and written to `ChromaManager` along with their original text and metadata.
   - **Branch B (Lexical):** The strings are tokenized into raw keywords and added to the `BM25Search` in-memory/disk index.

## Phase 2: Hybrid Search Execution
When a user submits a query via the Next.js Frontend:
1. **Request:** The frontend sends a `POST /api/hybrid` request containing the user's `query`.
2. **API Routing:** FastAPI intercepts the request and passes the query to the `HybridSearch` orchestrator.
3. **Parallel Execution:**
   - **Vector Query:** `HybridSearch` requests an embedding for the query string from `EmbeddingService`, then searches `ChromaManager` to find the top documents based on Cosine Similarity.
   - **Lexical Query:** `HybridSearch` passes the raw query string to `BM25Search` to find documents based on exact keyword matches.
4. **Reciprocal Rank Fusion (RRF):** The results from both engines are mathematically fused using the formula `Score = 1 / (60 + Rank)`. The resulting list is re-sorted to yield the absolute best combined results.
5. **Response:** FastAPI returns the fully formatted JSON results back to the Next.js UI, where they are rendered.

## Phase 3: Retrieval-Augmented Generation (Upcoming Sprint 10)
1. **Search Context:** Steps 1-4 of Phase 2 are executed to gather the top 3-5 most relevant documents.
2. **Prompt Injection:** The retrieved documents are dynamically injected into a system prompt (e.g., *"Answer the user using only this context: [DOCS]"*).
3. **LLM Generation:** The enriched prompt is sent to `LLMService` (which calls OpenAI, Gemini, etc.).
4. **Final Output:** The LLM generates a human-readable answer grounded in the retrieved data, which is streamed back to the user interface.
