import sys
import os
# pyrefly: ignore [missing-import]
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# Add the current directory to sys.path to enable local imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from llm.gemini_client import GeminiClient
from llm.openai_client import OpenAIClient
from llm.anthropic_client import ClaudeClient
from llm.prompt_templates import PromptTemplates
from huggingface.tokenizer_utils import get_tokenizer_data
from utils.tokenizer_metrics import calculate_metrics
from huggingface.embedding_utils import generate_embeddings
from huggingface.similarity import cosine_scores, query_similarity
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE
from sklearn.cluster import KMeans
import numpy as np

# RAG / Search Imports (Phase 2)
from core.embeddings.embedding_service import EmbeddingService
from core.vectordb.chroma_manager import ChromaManager
from core.search.bm25_search import BM25Search
from core.search.hybrid_search import HybridSearch
from typing import Dict, Any

# Document Manager Imports (RAG Sprint 1)
from core.documents.loader import DocumentLoader
from core.documents.parser import DocumentParser
from core.documents.metadata import DocumentManager

# Chunking Imports (RAG Sprint 2)
from core.chunking.fixed import FixedSizeChunker
from core.chunking.semantic import SemanticChunker
from core.chunking.hierarchical import HierarchicalChunker

app = FastAPI(
    title="LLM Playground Studio API",
    description="Backend API services supporting LLM Playground Studio",
    version="1.0.0"
)

# Enable CORS for Next.js dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------------
# RAG Search Services (Phase 2)
# ------------------------------------------------
rag_embedding_service = EmbeddingService()
rag_db_path = os.path.join(os.path.dirname(__file__), "chroma_db_api")
rag_chroma_manager = ChromaManager(db_path=rag_db_path, collection_name="master_collection")
rag_bm25_search = BM25Search()
rag_hybrid_search = HybridSearch(rag_embedding_service, rag_chroma_manager, rag_bm25_search)

# ------------------------------------------------
# Document Manager (RAG Sprint 1)
# ------------------------------------------------
doc_manager = DocumentManager()

# ------------------------------------------------
# In-Memory Run History Telemetry (Powers Analytics)
# ------------------------------------------------
run_history = []

def log_api_run(model_name: str, strategy: str, prompt: str, success: bool, response_time: float, word_count: int, character_count: int):
    run_history.append({
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "model": model_name,
        "strategy": strategy,
        "prompt": prompt[:100] + "..." if len(prompt) > 100 else prompt,
        "success": success,
        "response_time": response_time,
        "word_count": word_count,
        "character_count": character_count
    })

# ------------------------------------------------
# Pydantic Schemas
# ------------------------------------------------
class ChatRequest(BaseModel):
    prompt: str
    simulate: Optional[bool] = False

class PromptLabRequest(BaseModel):
    question: str
    strategy: str # "Normal", "Zero Shot", "Few Shot", "Chain of Thought"
    simulate: Optional[bool] = False

class TokenizeRequest(BaseModel):
    text: str
    tokenizer_type: str # "gpt", "bert", "sentencepiece"
    model_name: str
    include_special_tokens: Optional[bool] = True

class EmbeddingsRequest(BaseModel):
    sentences: List[str]
    model_name: str
    dim_algo: str # "PCA", "t-SNE"
    enable_cluster: Optional[bool] = False
    n_clusters: Optional[int] = 3

class SemanticSearchRequest(BaseModel):
    query: str
    sentences: List[str]
    model_name: str

# Phase 2 Search Schemas
class RagEmbedRequest(BaseModel):
    texts: List[str]

class RagSearchRequest(BaseModel):
    query: str
    top_k: int = 5

class RagInsertDocument(BaseModel):
    id: str
    title: str
    content: str
    metadata: Dict[str, Any] = {}

class RagInsertRequest(BaseModel):
    documents: List[RagInsertDocument]

# Chunking Request Schema (RAG Sprint 2)
class ChunkingRequest(BaseModel):
    text: str
    strategy: str  # "fixed", "semantic", "hierarchical"
    chunk_size: Optional[int] = 500
    chunk_overlap: Optional[int] = 50
    similarity_threshold: Optional[float] = 0.6
    use_tokens: Optional[bool] = False

# ------------------------------------------------
# API Routes
# ------------------------------------------------

@app.post("/api/chat")
async def api_chat(req: ChatRequest):
    if not req.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")
        
    client = GeminiClient()
    # Check if we should simulate
    res = client.generate_response(req.prompt, simulate=req.simulate)
    
    log_api_run(
        model_name=res.get("model", "Gemini 2.5 Flash"),
        strategy="Chat",
        prompt=req.prompt,
        success=res["success"],
        response_time=res["response_time"],
        word_count=res["word_count"],
        character_count=res["character_count"]
    )
    return res

@app.post("/api/prompt-lab")
async def api_prompt_lab(req: PromptLabRequest):
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")
        
    # Format prompt templates
    if req.strategy == "Normal":
        prompt_text = PromptTemplates.normal(req.question)
    elif req.strategy == "Zero Shot":
        prompt_text = PromptTemplates.zero_shot(req.question)
    elif req.strategy == "Few Shot":
        prompt_text = PromptTemplates.few_shot(req.question)
    elif req.strategy == "Chain of Thought":
        prompt_text = PromptTemplates.chain_of_thought(req.question)
    else:
        raise HTTPException(status_code=400, detail="Invalid strategy type")
        
    client = GeminiClient()
    res = client.generate_response(prompt_text, simulate=req.simulate)
    
    log_api_run(
        model_name=res.get("model", "Gemini 2.5 Flash"),
        strategy=f"Prompt Lab ({req.strategy})",
        prompt=prompt_text,
        success=res["success"],
        response_time=res["response_time"],
        word_count=res["word_count"],
        character_count=res["character_count"]
    )
    
    # Return both the constructed prompt and LLM result
    return {
        "prompt_sent": prompt_text,
        "result": res
    }

@app.post("/api/tokenize")
async def api_tokenize(req: TokenizeRequest):
    if not req.text.strip():
        return {
            "tokens": [],
            "ids": [],
            "vocab_size": 0,
            "metrics": {
                "token_count": 0,
                "char_count": 0,
                "avg_token_len": 0.0,
                "longest_token": "",
                "longest_token_len": 0,
                "char_token_ratio": 0.0
            }
        }
        
    res = get_tokenizer_data(
        req.text, 
        req.tokenizer_type, 
        req.model_name, 
        include_special_tokens=req.include_special_tokens
    )
    
    if not res["success"]:
        raise HTTPException(status_code=500, detail=res["error"])
        
    metrics = calculate_metrics(req.text, res["tokens"], res["ids"])
    
    return {
        "tokens": res["tokens"],
        "ids": res["ids"],
        "vocab_size": res["vocab_size"],
        "algorithm": res["algorithm"],
        "metrics": metrics
    }

@app.post("/api/embeddings")
async def api_embeddings(req: EmbeddingsRequest):
    sentences = [s.strip() for s in req.sentences if s.strip()]
    if len(sentences) < 2:
        raise HTTPException(status_code=400, detail="Minimum 2 sentences required")
        
    try:
        # Generate embeddings
        embeddings = generate_embeddings(sentences, model_name=req.model_name)
        
        # Calculate pairwise cosine similarities
        sim_matrix = cosine_scores(embeddings).tolist() # Convert numpy array to list
        
        # Dimensionality Reduction for 2D Plotting
        n_samples = len(sentences)
        coords = None
        
        if req.dim_algo == "PCA":
            n_comp = min(2, n_samples)
            pca = PCA(n_components=n_comp)
            coords = pca.fit_transform(embeddings)
            if coords.shape[1] < 2:
                coords = np.column_stack((coords[:, 0], np.zeros(n_samples)))
        else:
            perplexity = min(30, max(1, n_samples - 1))
            tsne = TSNE(n_components=2, perplexity=perplexity, random_state=42, init='pca')
            coords = tsne.fit_transform(embeddings)
            
        # K-Means Clustering
        clusters = [0] * n_samples
        if req.enable_cluster:
            actual_k = min(req.n_clusters, n_samples)
            kmeans = KMeans(n_clusters=actual_k, random_state=42)
            clusters = kmeans.fit_predict(embeddings).tolist()
            
        # Structure points list
        points = []
        for i in range(n_samples):
            points.append({
                "sentence": sentences[i],
                "x": float(coords[i, 0]),
                "y": float(coords[i, 1]),
                "cluster": clusters[i],
                # Preview vector
                "vector_preview": embeddings[i][:20].tolist(),
                "vector_stats": {
                    "mean": float(embeddings[i].mean()),
                    "min": float(embeddings[i].min()),
                    "max": float(embeddings[i].max()),
                    "std": float(embeddings[i].std()),
                    "dimensions": len(embeddings[i])
                }
            })
            
        return {
            "similarity_matrix": sim_matrix,
            "points": points,
            "sentences": sentences
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/semantic-search")
async def api_semantic_search(req: SemanticSearchRequest):
    sentences = [s.strip() for s in req.sentences if s.strip()]
    if not req.query.strip() or not sentences:
        raise HTTPException(status_code=400, detail="Query and sentences cannot be empty")
        
    try:
        # Embed query and sentences
        query_emb = generate_embeddings(req.query, model_name=req.model_name)[0]
        sentences_embs = generate_embeddings(sentences, model_name=req.model_name)
        
        # Calculate similarity scores
        scores = query_similarity(query_emb, sentences_embs).tolist()
        
        # Compile results
        results = []
        for s, score in zip(sentences, scores):
            results.append({
                "sentence": s,
                "score": float(score)
            })
            
        # Sort in descending order
        results = sorted(results, key=lambda x: x["score"], reverse=True)
        return results
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/compare")
async def api_compare(req: ChatRequest):
    if not req.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")
        
    results = {}
    
    # 1. Call Gemini
    g_client = GeminiClient()
    g_res = g_client.generate_response(req.prompt, simulate=req.simulate)
    results["Gemini"] = g_res
    log_api_run(
        model_name=g_res.get("model", "Gemini 2.5 Flash"),
        strategy="Model Comparison",
        prompt=req.prompt,
        success=g_res["success"],
        response_time=g_res["response_time"],
        word_count=g_res["word_count"],
        character_count=g_res["character_count"]
    )
    
    # 2. Call OpenAI
    o_client = OpenAIClient()
    o_res = o_client.generate_response(req.prompt, simulate=req.simulate)
    results["OpenAI"] = o_res
    log_api_run(
        model_name=o_res.get("model", "GPT-4o-mini"),
        strategy="Model Comparison",
        prompt=req.prompt,
        success=o_res["success"],
        response_time=o_res["response_time"],
        word_count=o_res["word_count"],
        character_count=o_res["character_count"]
    )
    
    # 3. Call Claude
    c_client = ClaudeClient()
    c_res = c_client.generate_response(req.prompt, simulate=req.simulate)
    results["Claude"] = c_res
    log_api_run(
        model_name=c_res.get("model", "Claude 3.5 Sonnet"),
        strategy="Model Comparison",
        prompt=req.prompt,
        success=c_res["success"],
        response_time=c_res["response_time"],
        word_count=c_res["word_count"],
        character_count=c_res["character_count"]
    )
    
    return results

@app.get("/api/analytics")
async def api_analytics():
    return run_history

@app.post("/api/analytics/prefill")
async def api_prefill_analytics():
    global run_history
    models = ["Gemini 2.5 Flash", "GPT-4o-mini", "Claude 3.5 Sonnet"]
    strategies = [
        "Chat", 
        "Prompt Lab (Normal)", 
        "Prompt Lab (Zero Shot)", 
        "Prompt Lab (Few Shot)", 
        "Prompt Lab (Chain of Thought)", 
        "Model Comparison"
    ]
    
    now = datetime.now()
    
    # Prefill 30 mock runs over past 48 hours
    for i in range(30):
        model = random.choice(models) if 'random' in sys.modules else "GPT-4o-mini"
        # Quick fallback import if random not in modules
        import random as rnd
        model = rnd.choice(models)
        strategy = rnd.choice(strategies)
        success = rnd.choices([True, False], weights=[92, 8])[0]
        
        if not success:
            latency = 0.0
            words = 0
            chars = 0
            prompt = "An invalid or aborted request occurred."
        else:
            if "Gemini" in model:
                latency = round(rnd.uniform(0.3, 1.1), 2)
                prompt = "Explain quantum computing in basic terms."
            elif "GPT" in model:
                latency = round(rnd.uniform(0.6, 1.6), 2)
                prompt = "Write a quicksort helper function in Go."
            else: # Claude
                latency = round(rnd.uniform(0.8, 2.4), 2)
                prompt = "Draft an introductory pitch email to investors."
                
            words = rnd.randint(30, 300)
            chars = int(words * rnd.uniform(4.8, 5.5))
            
        time_offset = now - timedelta(hours=rnd.randint(1, 48), minutes=rnd.randint(0, 59))
        
        run_history.append({
            "timestamp": time_offset.strftime("%Y-%m-%d %H:%M:%S"),
            "model": model,
            "strategy": strategy,
            "prompt": prompt,
            "success": success,
            "response_time": latency,
            "word_count": words,
            "character_count": chars
        })
        
    # Sort
    run_history = sorted(run_history, key=lambda x: x["timestamp"])
    return {"message": "Sample history loaded successfully", "count": 30}

@app.post("/api/analytics/reset")
async def api_reset_analytics():
    global run_history
    run_history = []
    return {"message": "Run history telemetry cleared successfully"}

# ==========================================
# Phase 2: RAG / Search API Endpoints
# ==========================================
@app.post("/api/embed")
async def api_embed_phase2(req: RagEmbedRequest):
    try:
        embeddings = rag_embedding_service.generate_batch_embeddings(req.texts)
        return {"status": "success", "count": len(embeddings)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/insert")
async def api_insert_phase2(req: RagInsertRequest):
    try:
        ids = [doc.id for doc in req.documents]
        contents = [doc.content for doc in req.documents]
        metadatas = [doc.metadata for doc in req.documents]
        
        embeddings = rag_embedding_service.generate_batch_embeddings(contents)
        rag_chroma_manager.insert_embeddings(ids=ids, embeddings=embeddings, documents=contents, metadatas=metadatas)
        
        dict_docs = [{"id": d.id, "title": d.title, "content": d.content, **d.metadata} for d in req.documents]
        rag_bm25_search.add_documents(dict_docs)
        
        return {"status": "success", "inserted": len(req.documents)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chroma")
async def api_chroma_phase2(req: RagSearchRequest):
    try:
        query_emb = rag_embedding_service.generate_embedding(req.query)
        results = rag_chroma_manager.query([query_emb], n_results=req.top_k)
        
        formatted = []
        if results['ids'] and results['ids'][0]:
            for i in range(len(results['ids'][0])):
                formatted.append({
                    "id": results['ids'][0][i],
                    "content": results['documents'][0][i],
                    "score": round(1.0 - results['distances'][0][i], 4),
                    "metadata": results['metadatas'][0][i] if results['metadatas'] else {}
                })
        return {"status": "success", "results": formatted}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/search")
async def api_search_phase2(req: RagSearchRequest):
    try:
        results = rag_bm25_search.search(req.query, top_k=req.top_k)
        return {"status": "success", "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/hybrid")
async def api_hybrid_phase2(req: RagSearchRequest):
    try:
        results = rag_hybrid_search.search(req.query, top_k=req.top_k)
        return {"status": "success", "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==========================================
# Phase 3: Document Manager API (RAG Sprint 1)
# ==========================================
@app.post("/api/documents/upload")
async def api_upload_document(file: UploadFile = File(...)):
    """Upload a document (PDF, DOCX, TXT, MD) and store it."""
    try:
        file_bytes = await file.read()
        filename = file.filename or "unknown.txt"

        # Load and parse the document
        raw_text = DocumentLoader.load_from_bytes(file_bytes, filename)
        parsed = DocumentParser.parse(raw_text, filename)

        # Store document and metadata
        metadata = doc_manager.add_document(filename, file_bytes, parsed)

        return {"status": "success", "document": metadata}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/documents")
async def api_list_documents():
    """List all uploaded documents with metadata."""
    documents = doc_manager.list_documents()
    return {"status": "success", "documents": documents, "count": len(documents)}

@app.get("/api/documents/stats/overview")
async def api_document_stats():
    """Get aggregate document statistics."""
    stats = doc_manager.get_statistics()
    return {"status": "success", "statistics": stats}

@app.post("/api/documents/load-sample")
async def api_load_sample_document():
    """Load the sample LLM Foundations PDF for testing."""
    try:
        sample_path = os.path.join(os.path.dirname(__file__), "data", "sample_docs", "llm_foundations.pdf")
        if not os.path.exists(sample_path):
            raise HTTPException(status_code=404, detail="Sample PDF not found. Run scripts/generate_sample_pdf.py first.")

        with open(sample_path, "rb") as f:
            file_bytes = f.read()

        raw_text = DocumentLoader.load(sample_path)
        parsed = DocumentParser.parse(raw_text, "llm_foundations.pdf")
        metadata = doc_manager.add_document("llm_foundations.pdf", file_bytes, parsed)

        return {"status": "success", "document": metadata}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/documents/{doc_id}")
async def api_get_document(doc_id: str):
    """Get a specific document's metadata and content."""
    metadata = doc_manager.get_document(doc_id)
    if not metadata:
        raise HTTPException(status_code=404, detail=f"Document '{doc_id}' not found")
    content = doc_manager.get_document_content(doc_id)
    return {"status": "success", "document": metadata, "content": content}

@app.delete("/api/documents/{doc_id}")
async def api_delete_document(doc_id: str):
    """Delete a document by ID."""
    deleted = doc_manager.delete_document(doc_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Document '{doc_id}' not found")
    return {"status": "success", "message": f"Document '{doc_id}' deleted"}

# ==========================================
# Phase 4: Chunking Explorer API (RAG Sprint 2)
# ==========================================
@app.post("/api/chunking/preview")
async def api_chunk_preview(req: ChunkingRequest):
    """Preview document chunking using various strategies."""
    try:
        if req.strategy == "fixed":
            chunker = FixedSizeChunker(
                chunk_size=req.chunk_size or 500,
                chunk_overlap=req.chunk_overlap or 50,
                use_tokens=req.use_tokens or False
            )
        elif req.strategy == "semantic":
            # Pass our global embedding service
            chunker = SemanticChunker(
                embedding_service=rag_embedding_service,
                similarity_threshold=req.similarity_threshold or 0.6
            )
        elif req.strategy == "hierarchical":
            # Compute parent & child configurations
            parent_size = req.chunk_size or 1000
            parent_overlap = req.chunk_overlap or 100
            child_size = max(parent_size // 4, 100)
            child_overlap = child_size // 10

            chunker = HierarchicalChunker(
                parent_size=parent_size,
                parent_overlap=parent_overlap,
                child_size=child_size,
                child_overlap=child_overlap,
                use_tokens=req.use_tokens or False
            )
        else:
            raise HTTPException(status_code=400, detail=f"Unknown chunking strategy: {req.strategy}")

        chunks = chunker.chunk(req.text)
        return {"status": "success", "chunks": chunks, "count": len(chunks)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
