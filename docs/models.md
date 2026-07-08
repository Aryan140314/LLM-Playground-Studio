# Model Directory & Capabilities

This document details the Large Language Models (LLMs) and local machine learning models used in **LLM Playground Studio**.

---

## 1. Large Language Models (APIs)

The application communicates with the following external LLM providers when **Simulation Mode** is disabled.

### A. Gemini 2.5 Flash
- **Provider:** Google AI Studio (Gemini API)
- **Model ID in Code:** `gemini-2.5-flash`
- **Context Window:** 1 Million Tokens (Provider spec)
- **Capabilities:** High-speed text generation, reasoning, multimodal capabilities.
- **Vision Support:** *Not implemented in the current repository.* The frontend only sends text queries.
- **Streaming:** *Not implemented in the current repository.*
- **Use Cases:** Core response generation in RAG Playground, prompt strategies testing, and evaluation metrics calculations.
- **Limitations:** Free tier API keys have strict rate limits (20 requests per day).

### B. GPT-4o-mini
- **Provider:** OpenAI API
- **Model ID in Code:** `gpt-4o-mini`
- **Context Window:** 128,000 Tokens (Provider spec)
- **Capabilities:** Fast completions, structured outputs, code generation.
- **Vision Support:** *Not implemented in the current repository.*
- **Streaming:** *Not implemented in the current repository.*
- **Use Cases:** Model speed comparison and output benchmarking.
- **Limitations:** Requires a paid OpenAI platform account with sufficient credits.

### C. Claude 3.5 Sonnet
- **Provider:** Anthropic API
- **Model ID in Code:** `claude-3-5-sonnet-latest`
- **Context Window:** 200,000 Tokens (Provider spec)
- **Capabilities:** Advanced reasoning, complex writing, and code generation.
- **Vision Support:** *Not implemented in the current repository.*
- **Streaming:** *Not implemented in the current repository.*
- **Use Cases:** Benchmark comparisons in the Model Comparison dashboard.
- **Limitations:** Higher latency compared to lightweight models like Gemini Flash.

---

## 2. Embedding Models (Local)

### Hugging Face SentenceTransformer
- **Provider:** Hugging Face (Local ML)
- **Model ID in Code:** `all-MiniLM-L6-v2`
- **Dimension:** 384 dimensions
- **Vision Support:** No
- **Use Cases:** Generating mathematical vector representations of sentences and documents.
- **Benefits:** Runs locally on CPU/GPU without needing external API calls.
- **Limitations:** Max context length is limited to 256 input tokens. Texts longer than this are truncated.

---

## 3. Tokenizer Configurations (Local)

The **Tokenizer Explorer** supports three local algorithms:

### A. Byte-Pair Encoding (BPE)
- **Model / Library:** `tiktoken`
- **Encoding Scheme:** `cl100k_base` (used by GPT-4 and GPT-3.5)
- **Vocabulary Size:** `100,277` tokens
- **Use Case:** Tokenizing text input into integers for OpenAI model processing.

### B. WordPiece
- **Model / Library:** Hugging Face `transformers`
- **Encoding Scheme:** `bert-base-uncased` tokenizer configuration
- **Vocabulary Size:** `30,522` tokens
- **Use Case:** Standard tokenization pattern used in Google BERT models.

### C. SentencePiece
- **Model / Library:** Hugging Face `transformers` / `sentencepiece`
- **Encoding Scheme:** `t5-small` model tokenizer configuration
- **Vocabulary Size:** `32,100` tokens
- **Use Case:** Multilingual subword tokenization that processes raw text without pre-tokenization steps.
