# Deployment Guide

This guide outlines deployment options for putting **LLM Playground Studio** into production or staging environments.

---

## 1. Production Requirements & Architecture

When deploying the studio to a remote server, keep in mind:
- **Local Machine Learning Models:** The backend loads `all-MiniLM-L6-v2` (`~120MB` download size) into RAM. Ensure the server has at least **2GB RAM** (4GB recommended if running other processes).
- **Persistent Storage:** ChromaDB saves data locally to disk (`backend/chroma_db_api/`). The deployment server must have persistent storage to prevent data loss on restarts.
- **Port Bindings:**
  - Frontend: `3000` (Next.js Node server)
  - Backend: `8000` (FastAPI Uvicorn server)

---

## 2. Docker Deployment

*Not implemented in the current repository.* 
There are no `Dockerfile` or `docker-compose.yml` configs present in the project. This is a **recommended improvement** for deployment automation.

### Recommended Docker Architecture:
1. **Backend Dockerfile:** Build from `python:3.10-slim`, install system packages, copy requirements, run `pip install`, and expose port `8000`.
2. **Frontend Dockerfile:** Build using multi-stage Node images (building Next.js assets) and expose port `3000`.
3. **Orchestrator:** A `docker-compose.yml` file to run both services together, using volume mounts to persist ChromaDB index directories.

---

## 3. Manual Deployment on Cloud Virtual Machines (EC2, DigitalOcean, etc.)

To deploy manually, follow these steps:

### A. Deploy Python Backend API
1. Launch a virtual machine (Ubuntu 22.04 LTS is recommended).
2. Configure security groups to allow traffic on ports `8000` and `3000`.
3. Clone the repository and install system dependencies:
   ```bash
   sudo apt update
   sudo apt install git python3-pip python3-venv build-essential -y
   ```
4. Create a virtual environment, install requirements, and set up your `.env` configuration file with active API keys.
5. Set up `systemd` to keep the FastAPI service running:
   Create `/etc/systemd/system/llm-backend.service`:
   ```ini
   [Unit]
   Description=FastAPI Backend for LLM Studio
   After=network.target

   [Service]
   User=ubuntu
   WorkingDirectory=/home/ubuntu/LLM-Playground-Studio/backend
   ExecStart=/home/ubuntu/LLM-Playground-Studio/backend/.venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```
6. Start the systemd service:
   ```bash
   sudo systemctl start llm-backend
   sudo systemctl enable llm-backend
   ```

### B. Deploy Frontend App
1. Install Node.js on the server:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs
   ```
2. Navigate to `frontend/`, run `npm install`, and build the static assets:
   ```bash
   npm run build
   ```
3. Set up PM2 to keep the Next.js frontend running:
   ```bash
   sudo npm install -y -g pm2
   pm2 start npm --name "llm-frontend" -- run start
   pm2 save
   pm2 startup
   ```

### C. Nginx Reverse Proxy (Recommended Setup)
It is recommended to run Nginx on port 80 to route traffic to the backend and frontend services.
Example `/etc/nginx/sites-available/default` configuration:
```nginx
server {
    listen 80;
    server_name your_domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Reload Nginx to apply changes:
```bash
sudo systemctl restart nginx
```
---

## 4. Serverless / Static Deployments
- **Frontend (Vercel):** The Next.js frontend can be deployed directly to Vercel. However, you must update backend endpoints to point to your live backend API URL instead of `localhost:8000`.
- **Backend (Render / Fly.io):** The backend can be hosted on Render or Fly.io as a web service. Ensure you select a tier with at least 2GB of memory so that the SentenceTransformer weights can load successfully.
