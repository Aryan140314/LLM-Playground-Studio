# Troubleshooting Guide

This document lists common issues, causes, and solutions for **LLM Playground Studio**.

---

## 1. Installation Issues

### Error: `ModuleNotFoundError: No module named 'tiktoken'` (or similar libraries)
- **Cause:** Python dependencies were not installed inside the active virtual environment, or the environment was not activated.
- **Solution:** Activate your virtual environment and run the installation command again:
  ```bash
  # Windows
  .\.venv\Scripts\Activate.ps1
  pip install -r requirements.txt
  ```

### Error: `docx` or `PyPDF2` imports failing during document uploads
- **Cause:** Missing document processing libraries.
- **Solution:** Ensure you are using the latest `requirements.txt` file and run:
  ```bash
  pip install python-docx PyPDF2 python-multipart
  ```

---

## 2. API & Connectivity Issues

### Error: `x-goog-api-key` Authorization Failures with Gemini
- **Cause:** Google AI Studio keys starting with `AQ.` can cause authorization conflicts in the standard `google-genai` SDK client, which may misinterpret them as OAuth tokens.
- **Solution:** The `GeminiClient` in `backend/llm/gemini_client.py` has a built-in fallback. If the SDK call fails, it automatically retries using a direct HTTP POST request with the `x-goog-api-key` header. If this retry fails, verify your API key in the `.env` file.

### Error: API Key Rate Limits (429 Too Many Requests)
- **Cause:** Free tier API keys (especially Gemini's limit of 20 requests per day) are easily depleted.
- **Solution:** Toggle **Simulation Mode** in the sidebar. This simulates API responses locally without making network calls, conserving your API quota.

---

## 3. Vector Database Issues

### Error: `chromadb` build failing during installation
- **Cause:** ChromaDB requires C++ compilation tools on Windows during installation.
- **Solution:** Install the "Desktop development with C++" workload using the [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/), then run `pip install chromadb` again.

---

## 4. Frontend & Next.js Build Issues

### Error: Next.js compilation issues with Node versions
- **Cause:** Using older versions of Node.js (below v18).
- **Solution:** Upgrade Node.js to v18 or v20 LTS. Clean the project and reinstall dependencies:
  ```bash
  cd frontend
  rm -rf .next node_modules package-lock.json
  npm install --legacy-peer-deps
  npm run dev
  ```

---

## 5. Streaming Issues

### Issue: LLM responses do not stream token-by-token
- **Cause:** *Not implemented in the current repository.*
- **Solution:** The backend only supports returning complete text responses inside JSON payloads. Adding streaming support is a **recommended improvement**.
