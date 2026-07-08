# Configuration Manual

This document details all configuration options, environment variables, and settings files for **LLM Playground Studio**.

---

## 1. Environment Variables (`.env`)

The backend server loads variables from the `.env` file inside the `backend/` directory using the `python-dotenv` package.
A template file `.env.example` is located in the root directory.

| Variable Name | Purpose | Default Value | Security Risk |
| :--- | :--- | :--- | :--- |
| `GEMINI_API_KEY` | Key to connect to Google's Gemini models. | *None* | **Critical**. Provides access to Gemini models. Never commit this key to version control. |
| `OPENAI_API_KEY` | Key to connect to OpenAI's GPT models. | *None* | **Critical**. Provides access to OpenAI models. Never commit this key to version control. |
| `ANTHROPIC_API_KEY` | Key to connect to Anthropic's Claude models. | *None* | **Critical**. Provides access to Anthropic models. Never commit this key to version control. |

---

## 2. Configuration Files

### A. Backend Settings (`backend/config/`)
All backend configurations are grouped under `backend/config/`:
- **`api_keys.py`:** Reads model provider API keys from environment variables:
  ```python
  OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
  GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
  ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
  ```
- **`settings.py`:** Holds general application constants like application names:
  ```python
  APP_NAME = "LLM Playground Studio"
  ```
- **`constants.py`:** Declares parameter defaults used during LLM completions:
  ```python
  DEFAULT_TEMPERATURE = 0.7
  DEFAULT_MAX_TOKENS = 512
  ```
- **`logging_config.py`:** Configures console log formatting dictionary parameters.

### B. Frontend Next.js Configuration (`frontend/`)
- **`next.config.ts`:**
  Configures Next.js compilation rules:
  ```typescript
  import type { NextConfig } from "next";

  const nextConfig: NextConfig = {
    /* config options here */
  };

  export default nextConfig;
  ```
- **`tsconfig.json`:** Defines TypeScript compiler rules.
- **`package.json` & `package-lock.json`:** Lists all frontend JavaScript and dev dependencies.

---

## 3. Storage Foldles
The application stores persistent files locally inside the `backend/` directory:
- **ChromaDB Path:** Configured in `main.py` using `backend/chroma_db_api/`.
- **Ingested Uploads Folder:** Files are saved to `backend/data/uploads/`.
- **Uploaded Metadata:** Tracked in the `_index.json` file inside `backend/data/uploads/`.

---

## 4. Security Notes & Best Practices

- **Avoid Hardcoding Secrets:** Never write API keys directly in files like `api_keys.py` or client scripts. Always load them from environment variables.
- **Gitignore Safety:** Ensure your `.gitignore` file includes rules to prevent uploading `.env` and local database files (`chroma_db_*`) to version control.
- **Sandbox Testing:** If you do not have active API keys, enable **Simulation Mode** in the sidebar. This will bypass external API calls and use mock responses locally.
- **CORS Configuration:** In `main.py`, CORS is configured to only allow requests from `http://localhost:3000`. Do not use wildcard `"*"` origins in production.
