# Security Manual

This document outlines the security parameters, risk mitigations, and recommended improvements for **LLM Playground Studio**.

---

## 1. Secrets & Credentials Management

### API Key Isolation
- The application uses API keys for Google Gemini, OpenAI, and Anthropic.
- **Backend Storage:** Keys are loaded from the backend `.env` file via `config/api_keys.py`.
- **Client Separation:** The Next.js frontend does not have access to these API keys. The client only calls backend endpoints, which handle the LLM requests.
- **Version Control Safety:** The `.gitignore` file includes rules to prevent uploading `.env` files to Git.

---

## 2. API Security

### CORS (Cross-Origin Resource Sharing)
- CORS configuration is defined in `main.py`.
- **Allowed Origin:** Requests are restricted to the frontend development server at `http://localhost:3000`.
- **Allowed Headers/Methods:** Allows standard methods (`GET`, `POST`, `DELETE`) and headers. Wildcard origins `"*"` should not be used in production.

---

## 3. Implemented vs. Missing Security Features

### A. Authentication & Authorization
- **Status:** *Not implemented in the current repository.*
- **Details:** The API endpoints are public and do not require user sign-in, session cookies, or JWT access tokens.
- **Recommended improvement:** Implement OAuth2 or session-based authentication to restrict access to the API endpoints.

### B. Prompt Injection Guardrails
- **Status:** *Not implemented in the current repository.*
- **Details:** User prompts are injected directly into templates. The system does not scan for malicious instructions designed to bypass system prompts.
- **Recommended improvement:** Implement an input validation layer to scan for prompt injection patterns before calling LLM APIs.

### C. Rate Limiting
- **Status:** *Not implemented in the current repository.*
- **Details:** The backend endpoints do not limit request rates. This makes the backend vulnerable to resource exhaustion or API quota depletion.
- **Recommended improvement:** Add rate-limiting middleware (such as `slowapi` in FastAPI) to restrict request rates per client IP.

### D. Input Validation & Content Scanning
- **Status:** *Partial implementation.*
- **Details:** The backend uses Pydantic schemas to validate request payloads (such as verifying sentence list lengths and numeric ranges). However, uploaded files are not scanned for malicious content.
- **Recommended improvement:** Scan uploaded files for malware or script patterns to prevent execution exploits.

### E. CSRF & XSS Protections
- **Status:** *Not implemented in the current repository.*
- **Details:** Next.js provides built-in escaping to protect against basic XSS. However, there is no CSRF protection middleware on the backend.
- **Recommended improvement:** Add CSRF token validation to state-changing POST and DELETE endpoints.
