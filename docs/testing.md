# Testing Guide

This document explains the testing setup, validation suites, and quality assurance recommendations for **LLM Playground Studio**.

---

## 1. Existing Test Suites

The backend includes test files located in the `backend/tests/` directory:

| Test File | Target | Verify Mechanics |
| :--- | :--- | :--- |
| [`test_embeddings.py`](file:///d:/GenAI/genAI-projects/LLM-Playground-Studio/backend/tests/test_embeddings.py) | Embedding Service | Confirms the local Hugging Face `all-MiniLM-L6-v2` model generates 384-dimensional vector arrays. |
| [`test_chroma.py`](file:///d:/GenAI/genAI-projects/LLM-Playground-Studio/backend/tests/test_chroma.py) | Vector Database Manager | Verifies client connections and collection initialization. |
| [`test_faiss.py`](file:///d:/GenAI/genAI-projects/LLM-Playground-Studio/backend/tests/test_faiss.py) | Lexical Search Engine | Verifies document tokenization and indexing using BM25. |
| [`test_prompting.py`](file:///d:/GenAI/genAI-projects/LLM-Playground-Studio/backend/tests/test_prompting.py) | Prompt Templates | Verifies prompt construction for Zero-Shot and Chain-of-Thought strategies. |
| [`test_search.py`](file:///d:/GenAI/genAI-projects/LLM-Playground-Studio/backend/tests/test_search.py) | Fusion Search Engine | Verifies document ranking and scoring calculations using RRF. |

There are also several utility scripts inside the `backend/` root directory (such as `test_similarity.py` and `test_chunking.py`) that can be executed to verify specific module mechanics.

---

## 2. Running Tests Locally

Navigate to the `backend/` directory and run tests using `pytest`:

```bash
cd backend
.venv\Scripts\activate
pytest
```

To run a specific test file:
```bash
pytest tests/test_embeddings.py
```

To run test files and print output to the console:
```bash
pytest -v
```

---

## 3. Missing Tests & Recommended Improvements

### A. Frontend Unit & Integration Tests
- **Status:** *Not implemented in the current repository.*
- **Details:** The Next.js frontend has no unit tests or component test suites (like Jest or React Testing Library).
- **Recommended improvement:** Add Jest and React Testing Library to test component rendering, theme switching, and simulation mode toggles.

### B. E2E (End-to-End) Tests
- **Status:** *Not implemented in the current repository.*
- **Details:** There are no end-to-end browser automation suites.
- **Recommended improvement:** Set up Playwright or Cypress to automate flows like uploading documents, running chunking previews, executing hybrid searches, and verifying RAG responses.

### C. CI/CD Integration
- **Status:** *Not implemented in the current repository.*
- **Details:** The repository does not include workflows (like GitHub Actions) to automate test execution on pull requests or commits.
- **Recommended improvement:** Add a GitHub Actions workflow (`.github/workflows/test.yml`) to automatically run backend tests and frontend lints on every push.
