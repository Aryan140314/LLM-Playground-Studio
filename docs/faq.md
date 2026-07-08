# Frequently Asked Questions (FAQ)

Here are answers to common questions about **LLM Playground Studio**.

---

### Q1: Do I need paid API keys from OpenAI, Gemini, or Claude to run the project?
**No.** The application features a global **Simulation Mode** toggle in the sidebar. When enabled, the backend returns simulated responses and metrics locally, allowing you to test the interface without making external network requests or using your API quota.

---

### Q2: What is the default local embedding model, and where is it run?
The application uses the `all-MiniLM-L6-v2` model from Hugging Face's `sentence-transformers` library. This model runs locally on your machine's CPU (or GPU if configured) and maps sentences to a 384-dimensional vector space. No data is sent to external servers for vector generation.

---

### Q3: Where are the uploaded documents and vector indexes stored?
- **Uploaded Documents:** Files are stored in the `backend/data/uploads/` directory.
- **Document Metadata:** Document records and metrics are saved to `backend/data/uploads/_index.json`.
- **Vector Indexes:** ChromaDB vector indices are persisted to `backend/chroma_db_api/`.

---

### Q4: Why does the Gemini API client fail with standard SDK calls?
The Google GenAI SDK can sometimes encounter authorization conflicts when using API keys that start with the new `AQ.` prefix, misinterpreting them as OAuth tokens. To address this, `backend/llm/gemini_client.py` has a built-in fallback. If the SDK call fails, it automatically retries the request using a direct HTTP call with the `x-goog-api-key` header.

---

### Q5: How does the Hybrid Search model combine different search scores?
Lexical search (BM25) and semantic vector search (ChromaDB) use different scoring ranges. To combine them, the system uses the **Reciprocal Rank Fusion (RRF)** algorithm:
$$\text{RRF Score} = \frac{1}{60 + \text{Rank}_{\text{BM25}}} + \frac{1}{60 + \text{Rank}_{\text{Chroma}}}$$
By ranking results based on their position rather than their raw scores, RRF provides a unified, balanced similarity score.

---

### Q6: Can I run this application inside Docker?
*Not in the current repository.* There are no Docker configurations present in the workspace. Adding `Dockerfile` and `docker-compose.yml` templates is a **recommended improvement** on our roadmap.
