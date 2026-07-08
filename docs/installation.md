# Installation & Local Setup

Follow these instructions to set up the development environments for both the Python FastAPI backend and the Next.js frontend of **LLM Playground Studio**.

---

## 1. System Requirements

### Platform & OS
- **OS:** Windows 10/11, macOS, or Linux.
- **Python:** Version `3.10` or `3.11` is recommended.
- **Node.js:** Version `18` or `20` (LTS versions recommended).
- **npm:** Package manager installed alongside Node.js.

---

## 2. Environment Setup

### Clone the Repository
Clone the repository to your local system:
```bash
git clone https://github.com/Aryan140314/LLM-Playground-Studio.git
cd LLM-Playground-Studio
```

---

## 3. Backend (FastAPI) Setup

Navigate to the `backend` folder, configure a virtual environment, install the required packages, and start the server.

### A. Create Virtual Environment
Run the following command to create a virtual environment named `.venv`:
```bash
# Windows (Command Prompt)
python -m venv .venv
.venv\Scripts\activate.bat

# Windows (PowerShell)
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# macOS / Linux
python3 -m venv .venv
source .venv/bin/activate
```

### B. Install Python Dependencies
Install the required packages listed in `requirements.txt`:
```bash
pip install -r requirements.txt
```

### C. Configure Environment Variables
Create a file named `.env` in the `backend/` directory:
```env
OPENAI_API_KEY=your-openai-key-here
GEMINI_API_KEY=your-gemini-key-here
ANTHROPIC_API_KEY=your-anthropic-key-here
```
Refer to the [Configuration Guide](configuration.md) for more details.

### D. Run the Backend API Server
Start the development server with reload enabled:
```bash
python main.py
```
- **Port:** The API server runs at `http://localhost:8000`.
- **Interactive Documentation:** You can view the swagger UI docs at `http://localhost:8000/docs`.

---

## 4. Frontend (Next.js) Setup

Open a separate terminal, navigate to the `frontend/` directory, install packages, and start the development server.

### A. Install Node Dependencies
Install package dependencies:
```bash
cd frontend
npm install --legacy-peer-deps
```

### B. Run the Frontend App
Start the Next.js development server:
```bash
npm run dev
```
- **Port:** The frontend interface runs at `http://localhost:3000`.

---

## 5. Troubleshooting Installation Issues

- **Hugging Face Model Downloads:** The backend downloads the local model `all-MiniLM-L6-v2` automatically on startup. Ensure you have an active internet connection on the first run.
- **CORS Errors:** If you see CORS errors in your browser console, verify that your backend `main.py` is configured to allow requests from `http://localhost:3000`.
- **Port Conflicts:** If ports `8000` or `3000` are already in use, you can run uvicorn on a different port:
  ```bash
  python -m uvicorn main:app --port 8001
  ```
