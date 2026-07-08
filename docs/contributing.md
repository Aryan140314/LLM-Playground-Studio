# Contributing Guidelines

Thank you for your interest in contributing to **LLM Playground Studio**! Follow these guidelines to submit high-quality improvements, bug fixes, and features.

---

## 1. Code of Conduct
Please be respectful and collaborative when interacting with other contributors and maintainers.

---

## 2. Getting Started

### Step 1: Fork and Clone the Repository
Fork the repository on GitHub and clone your fork locally:
```bash
git clone https://github.com/your-username/LLM-Playground-Studio.git
cd LLM-Playground-Studio
```

### Step 2: Set Up Local Development
Set up both the backend and frontend environments by following the [Installation Guide](installation.md).

---

## 3. Contribution Workflow

### A. Branch Naming Conventions
Create a new branch from `main` using one of the following prefixes:
- **`feat/`** for new features (e.g., `feat/add-cohere-rerank`)
- **`fix/`** for bug fixes (e.g., `fix/gemini-auth-header`)
- **`docs/`** for documentation changes (e.g., `docs/update-api-reference`)
- **`refactor/`** for code refactoring (e.g., `refactor/modularize-chunkers`)

### B. Coding Style & Linting
- **Python:** Follow PEP 8 styles. You can format code using `black` or `ruff`.
- **TypeScript / React:** Use standard camelCase for variables and PascalCase for components. Run `npm run lint` inside the `frontend/` directory to verify there are no compilation warnings.

### C. Commit Message Format
Write clear, concise commit messages using imperative language:
- `feat: add Cross-Encoder re-ranking to hybrid search`
- `fix: resolve auth token issue with Gemini client`
- `docs: add instructions for running pytest suites`

---

## 4. Submitting Pull Requests

1. Run the local tests to ensure no functionality is broken:
   ```bash
   cd backend
   pytest
   ```
2. Push your changes to your fork:
   ```bash
   git push origin feat/your-feature-name
   ```
3. Open a Pull Request (PR) on the main repository.
4. Provide a description of your changes, what was tested, and how to verify them.
5. Wait for a project maintainer to review and merge your PR.

---

## 5. Submitting Issues & Feedback

When reporting issues or proposing enhancements, please use the following templates:

### Bug Report Template
- **Title:** Clear description of the bug.
- **Description:** What is currently happening and what should happen instead.
- **Steps to Reproduce:** List the steps to reproduce the issue.
- **Environment:** OS, Node version, Python version, and API key provider.
- **Error Logs:** Paste relevant error messages or console stack traces.

### Feature Request Template
- **Title:** Clear description of the proposed feature.
- **Description:** Problem statement or user story explaining why this feature is needed.
- **Proposed Solution:** Describe the implementation design or visual UI ideas.
