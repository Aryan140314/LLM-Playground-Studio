# API Reference Documentation

This document outlines the REST API endpoints exposed by the Python FastAPI backend of **LLM Playground Studio**.

---

## 1. Global Specifications

- **Server Base URL:** `http://localhost:8000`
- **Global Headers:**
  - `Content-Type: application/json`
  - `Accept: application/json`
- **Authentication:**
  - *Not implemented in the current repository.* API keys for LLMs are loaded on the backend from the `.env` configuration file.
- **Error Formats:**
  Errors return standard FastAPI validation blocks or internal exceptions:
  ```json
  {
    "detail": "Error message description"
  }
  ```

---

## 2. API Endpoints

### `POST /api/chat`
Sends a prompt to Gemini 2.5 Flash and logs performance telemetry.

- **Request Body:**
  ```json
  {
    "prompt": "Explain quantum computing in basic terms",
    "simulate": false
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "model": "Gemini 2.5 Flash",
    "text": "Quantum computing is...",
    "response_time": 0.85,
    "word_count": 210,
    "character_count": 1200
  }
  ```

---

### `POST /api/prompt-lab`
Renders prompt engineering templates (Zero-Shot, Few-Shot, CoT) and returns the generated response.

- **Request Body:**
  ```json
  {
    "question": "What is machine learning?",
    "strategy": "Zero Shot",
    "simulate": false
  }
  ```
- **Response:**
  ```json
  {
    "prompt_sent": "\nYou are a helpful AI assistant...",
    "result": {
      "success": true,
      "model": "Gemini 2.5 Flash",
      "text": "Machine learning is...",
      "response_time": 0.65,
      "word_count": 85,
      "character_count": 520
    }
  }
  ```

---

### `POST /api/tokenize`
Tokenizes a string and returns subword lists, vocabulary IDs, and length metrics.

- **Request Body:**
  ```json
  {
    "text": "Hello world!",
    "tokenizer_type": "gpt",
    "model_name": "gpt-4o-mini",
    "include_special_tokens": true
  }
  ```
- **Response:**
  ```json
  {
    "tokens": ["Hello", " world", "!"],
    "ids": [9906, 1917, 0],
    "vocab_size": 100277,
    "algorithm": "Byte-Pair Encoding (BPE)",
    "metrics": {
      "token_count": 3,
      "char_count": 12,
      "avg_token_len": 4.0,
      "longest_token": " world",
      "longest_token_len": 6,
      "char_token_ratio": 4.0
    }
  }
  ```

---

### `POST /api/embeddings`
Generates high-dimensional embeddings for a batch of sentences, runs dimensionality reduction for 2D plotting, and clusters vectors using K-Means.

- **Request Body:**
  ```json
  {
    "sentences": ["Sentence A", "Sentence B"],
    "model_name": "all-MiniLM-L6-v2",
    "dim_algo": "PCA",
    "enable_cluster": true,
    "n_clusters": 2
  }
  ```
- **Response:**
  ```json
  {
    "similarity_matrix": [[1.0, 0.45], [0.45, 1.0]],
    "points": [
      {
        "sentence": "Sentence A",
        "x": 0.524,
        "y": -0.112,
        "cluster": 0,
        "vector_preview": [0.015, -0.024],
        "vector_stats": {
          "mean": 0.002,
          "min": -0.125,
          "max": 0.145,
          "std": 0.045,
          "dimensions": 384
        }
      }
    ],
    "sentences": ["Sentence A", "Sentence B"]
  }
  ```

---

### `POST /api/compare`
Queries Gemini, OpenAI, and Claude models concurrently to compare their response latencies and outputs.

- **Request Body:**
  ```json
  {
    "prompt": "Write a Hello World function in Python",
    "simulate": true
  }
  ```
- **Response:**
  ```json
  {
    "Gemini": { "success": true, "model": "Gemini 2.5 Flash", "text": "...", "response_time": 0.42 },
    "OpenAI": { "success": true, "model": "GPT-4o-mini", "text": "...", "response_time": 0.72 },
    "Claude": { "success": true, "model": "Claude 3.5 Sonnet", "text": "...", "response_time": 1.12 }
  }
  ```

---

### `GET /api/analytics`
Fetches the in-memory run history telemetry log.

- **Response:**
  ```json
  [
    {
      "timestamp": "2026-07-08 12:00:00",
      "model": "Gemini 2.5 Flash",
      "strategy": "Chat",
      "prompt": "Hello...",
      "success": true,
      "response_time": 0.42,
      "word_count": 10,
      "character_count": 50
    }
  ]
  ```

---

### `POST /api/analytics/prefill`
Loads mock runs into telemetry logs for demonstration purposes.

- **Response:**
  ```json
  {
    "message": "Sample history loaded successfully",
    "count": 30
  }
  ```

---

### `POST /api/analytics/reset`
Clears the in-memory run history logs.

- **Response:**
  ```json
  {
    "message": "Run history telemetry cleared successfully"
  }
  ```

---

### `POST /api/embed`
Generates embeddings for raw text input batches.

- **Request Body:**
  ```json
  {
    "texts": ["chunk one text string", "chunk two text string"]
  }
  ```
- **Response:**
  ```json
  {
    "status": "success",
    "count": 2
  }
  ```

---

### `POST /api/insert`
Inserts document data into the persistent vector database and traditional lexical search indexes.

- **Request Body:**
  ```json
  {
    "documents": [
      {
        "id": "doc_1",
        "title": "Document Title",
        "content": "Raw document content goes here...",
        "metadata": { "author": "User" }
      }
    ]
  }
  ```
- **Response:**
  ```json
  {
    "status": "success",
    "inserted": 1
  }
  ```

---

### `POST /api/chroma`
Executes semantic vector searches against ChromaDB.

- **Request Body:**
  ```json
  {
    "query": "search query",
    "top_k": 3
  }
  ```
- **Response:**
  ```json
  {
    "status": "success",
    "results": [
      {
        "id": "doc_1",
        "content": "Raw document content...",
        "score": 0.885,
        "metadata": { "author": "User" }
      }
    ]
  }
  ```

---

### `POST /api/search`
Performs keyword-based lexical searches using BM25.

- **Request Body:**
  ```json
  {
    "query": "keyword search term",
    "top_k": 3
  }
  ```
- **Response:**
  ```json
  {
    "status": "success",
    "results": [
      {
        "id": "doc_1",
        "title": "Document Title",
        "content": "Raw document content...",
        "similarity_score": 12.45
      }
    ]
  }
  ```

---

### `POST /api/hybrid`
Runs a hybrid search combining BM25 keyword search and ChromaDB vector search using Reciprocal Rank Fusion.

- **Request Body:**
  ```json
  {
    "query": "hybrid query terms",
    "top_k": 3
  }
  ```
- **Response:**
  ```json
  {
    "status": "success",
    "results": [
      {
        "id": "doc_1",
        "title": "Document Title",
        "content": "Raw document content...",
        "hybrid_score": 0.0328
      }
    ]
  }
  ```

---

### `POST /api/documents/upload`
Uploads files (PDF, DOCX, TXT, MD) and indexes their metadata.

- **Request Payload:** `multipart/form-data`
  - **file:** UploadFile (binary payload)
- **Response:**
  ```json
  {
    "status": "success",
    "document": {
      "id": "a4d3f5e1",
      "filename": "rag_paper.pdf",
      "stored_name": "a4d3f5e1.pdf",
      "file_type": "PDF",
      "file_size_bytes": 1254200,
      "page_count": 12,
      "word_count": 4520,
      "char_count": 28400,
      "uploaded_at": "2026-07-08 12:45:00"
    }
  }
  ```

---

### `GET /api/documents`
Lists all uploaded documents and their metadata.

- **Response:**
  ```json
  {
    "status": "success",
    "documents": [
      {
        "id": "a4d3f5e1",
        "filename": "rag_paper.pdf",
        "file_type": "PDF",
        "uploaded_at": "2026-07-08 12:45:00"
      }
    ],
    "count": 1
  }
  ```

---

### `GET /api/documents/stats/overview`
Retrieves aggregate document statistics (counts, file types, page numbers, word counts).

- **Response:**
  ```json
  {
    "status": "success",
    "statistics": {
      "total_documents": 2,
      "total_pages": 17,
      "total_words": 6480,
      "total_chars": 40200,
      "total_size_bytes": 1342000,
      "file_types": {
        "PDF": 1,
        "TXT": 1
      }
    }
  }
  ```

---

### `POST /api/documents/load-sample`
Loads the sample `llm_foundations.pdf` file into document storage for testing.

- **Response:**
  ```json
  {
    "status": "success",
    "document": {
      "id": "sample_id",
      "filename": "llm_foundations.pdf"
    }
  }
  ```

---

### `GET /api/documents/{doc_id}`
Retrieves parsed text content and metadata for a specific document.

- **Response:**
  ```json
  {
    "status": "success",
    "document": { "id": "a4d3f5e1" },
    "content": "Raw parsed content text..."
  }
  ```

---

### `DELETE /api/documents/{doc_id}`
Deletes a document from disk and removes it from the index.

- **Response:**
  ```json
  {
    "status": "success",
    "message": "Document 'a4d3f5e1' deleted"
  }
  ```

---

### `POST /api/chunking/preview`
Splits raw text strings using a selected chunking strategy (fixed, semantic, hierarchical) and returns the split chunks.

- **Request Body:**
  ```json
  {
    "text": "Paste text block here...",
    "strategy": "fixed",
    "chunk_size": 200,
    "chunk_overlap": 20,
    "use_tokens": false
  }
  ```
- **Response:**
  ```json
  {
    "status": "success",
    "chunks": [
      {
        "chunk_index": 1,
        "text": "Chunk text block...",
        "token_count": 48,
        "char_count": 200,
        "word_count": 35,
        "metadata": { "strategy": "fixed_character", "start_char": 0, "end_char": 200 }
      }
    ],
    "count": 1
  }
  ```

---

### `POST /api/embedding-pipeline/process`
Generates vectors for pre-split text chunks.

- **Request Body:**
  ```json
  {
    "chunks": ["chunk one text string", "chunk two text string"]
  }
  ```
- **Response:**
  ```json
  {
    "status": "success",
    "model_name": "all-MiniLM-L6-v2",
    "dimension": 384,
    "generation_time_sec": 0.084,
    "chunk_count": 2,
    "embeddings": [[0.0125, -0.0452], [0.0842, 0.0014]]
  }
  ```

---

### `GET /api/indexing/collections`
Lists all collections in the vector database and their document counts.

- **Response:**
  ```json
  {
    "status": "success",
    "collections": [
      { "name": "master_collection", "count": 25 },
      { "name": "test_collection", "count": 0 }
    ]
  }
  ```

---

### `POST /api/indexing/collections/create`
Creates a new collection in the vector database.

- **Request Body:**
  ```json
  {
    "name": "custom_collection"
  }
  ```
- **Response:**
  ```json
  {
    "status": "success",
    "message": "Collection 'custom_collection' created"
  }
  ```

---

### `DELETE /api/indexing/collections/{name}`
Deletes a collection from the vector database.

- **Response:**
  ```json
  {
    "status": "success",
    "message": "Collection 'custom_collection' deleted"
  }
  ```

---

### `POST /api/indexing/index`
Indexes pre-computed vectors and text chunks into a database collection.

- **Request Body:**
  ```json
  {
    "collection_name": "master_collection",
    "chunks": ["chunk text"],
    "embeddings": [[0.0125, -0.0452]],
    "doc_id": "a4d3f5e1",
    "doc_name": "rag_paper.pdf"
  }
  ```
- **Response:**
  ```json
  {
    "status": "success",
    "indexed_count": 1
  }
  ```

---

### `POST /api/retrieval/query`
Queries a collection in the vector database and returns the top-K relevant chunks.

- **Request Body:**
  ```json
  {
    "query": "Who is the author of RAG?",
    "collection_name": "master_collection",
    "top_k": 3
  }
  ```
- **Response:**
  ```json
  {
    "status": "success",
    "results": [
      {
        "id": "chunk_id",
        "content": "RAG was developed by...",
        "similarity": 0.842,
        "metadata": { "doc_name": "rag_paper.pdf", "chunk_index": 1 }
      }
    ]
  }
  ```

---

### `POST /api/prompt-builder/build`
Builds a grounded prompt by combining context chunks, system instructions, and a user question.

- **Request Body:**
  ```json
  {
    "question": "What is RAG?",
    "contexts": [
      { "content": "RAG stands for...", "metadata": { "doc_name": "rag_paper.pdf", "chunk_index": 1 } }
    ],
    "system_instructions": "Be very concise."
  }
  ```
- **Response:**
  ```json
  {
    "status": "success",
    "full_prompt": "System Instructions:\nBe very concise.\n\nContext:\n[Source: rag_paper.pdf | Chunk: 1]\nRAG stands for...\n\nQuestion:\nWhat is RAG?\n\nAnswer:",
    "system_instructions": "Be very concise.",
    "context_block": "[Source: rag_paper.pdf | Chunk: 1]\nRAG stands for...",
    "char_count": 145,
    "word_count": 22,
    "token_count": 28
  }
  ```

---

### `POST /api/rag/generation`
Runs the complete Naive RAG pipeline (retrieves context, constructs prompt, generates answer, and log stats).

- **Request Body:**
  ```json
  {
    "question": "What is RAG?",
    "collection_name": "master_collection",
    "top_k": 3,
    "system_instructions": "Be very concise.",
    "simulate": false
  }
  ```
- **Response:**
  ```json
  {
    "status": "success",
    "answer": "Retrieval-Augmented Generation (RAG) is...",
    "full_prompt": "...",
    "retrieved_contexts": [
      { "id": "chunk_1", "content": "RAG stands for...", "similarity": 0.842, "metadata": { "doc_name": "rag_paper.pdf" } }
    ],
    "response_time": 0.72,
    "word_count": 52,
    "token_count": 340
  }
  ```

---

### `POST /api/retrieval/compare`
Queries and returns search results from multiple retrieval strategies (Naive semantic search, Hybrid, HyDE, Multi-Query) side-by-side.

- **Request Body:**
  ```json
  {
    "query": "quantum mechanics",
    "collection_name": "master_collection",
    "top_k": 2,
    "simulate": false
  }
  ```
- **Response:**
  ```json
  {
    "status": "success",
    "naive": [
      { "id": "chunk_1", "content": "Quantum mechanics deals with...", "similarity": 0.81 }
    ],
    "hybrid": [
      { "id": "chunk_1", "content": "Quantum mechanics deals with...", "similarity": 0.032 }
    ],
    "hyde": {
      "hypothetical_doc": "In this hypothetical answer regarding quantum mechanics...",
      "chunks": [
        { "id": "chunk_1", "content": "Quantum mechanics deals with...", "similarity": 0.84 }
      ]
    },
    "multiquery": {
      "queries_generated": ["quantum physics", "definition of quantum mechanics"],
      "chunks": [
        { "id": "chunk_1", "content": "Quantum mechanics deals with...", "similarity": 0.81 }
      ]
    }
  }
  ```

---

### `POST /api/rag/evaluate`
Runs evaluation metrics (Faithfulness, Answer Relevancy, Context Recall) on a RAG output using LLM judges.

- **Request Body:**
  ```json
  {
    "question": "What is RAG?",
    "answer": "RAG stands for...",
    "contexts": [
      { "content": "RAG stands for...", "metadata": { "doc_name": "rag_paper.pdf" } }
    ],
    "simulate": false
  }
  ```
- **Response:**
  ```json
  {
    "status": "success",
    "faithfulness": 0.95,
    "relevancy": 0.9,
    "recall": 0.88,
    "overall_rag_score": 0.91,
    "details": "Evaluation computed live using Gemini LLM judges."
  }
  ```
