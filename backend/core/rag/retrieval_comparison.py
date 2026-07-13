"""
Retrieval Comparison Service

Implements advanced RAG retrieval strategies:
1. Naive (Semantic search only)
2. Hybrid (Semantic + Lexical keyword fused)
3. HyDE (Hypothetical Document Embeddings via LLM)
4. Multi-Query (Query Expansion / alternative prompts via LLM)
"""

from typing import List, Dict, Any, Optional
import time
from core.rag.retriever import RetrievalService
from core.search.hybrid_search import HybridSearch
from llm.gemini_client import GeminiClient


class RetrievalComparer:
    """Runs and compares Naive, Hybrid, HyDE, and Multi-Query retrieval models."""

    def __init__(
        self,
        retrieval_service: RetrievalService,
        hybrid_search: HybridSearch,
        gemini_client: Optional[GeminiClient] = None
    ):
        self.retrieval_service = retrieval_service
        self.hybrid_search = hybrid_search
        self.gemini_client = gemini_client or GeminiClient()

    def run_naive(self, query: str, collection_name: str, top_k: int) -> List[Dict[str, Any]]:
        """Standard semantic vector retrieval."""
        return self.retrieval_service.retrieve(query, collection_name, top_k=top_k)

    def run_hybrid(self, query: str, top_k: int = 3, collection_name: str = "master_collection") -> List[Dict[str, Any]]:
        """Hybrid search (Semantic + Keyword fused via Reciprocal Rank Fusion)."""
        results = self.hybrid_search.search(query, top_k=top_k, collection_name=collection_name)
        
        # Format output to match retriever structure
        formatted = []
        for r in results:
            formatted.append({
                "id": r.get("id", ""),
                "content": r.get("content", ""),
                "similarity": r.get("hybrid_score", r.get("score", 0.0)),
                "metadata": {
                    "doc_name": r.get("doc_name", "Unknown"),
                    "chunk_index": r.get("chunk_index", 0)
                }
            })
        return formatted

    def run_hyde(self, query: str, collection_name: str, top_k: int, simulate: bool = False) -> Dict[str, Any]:
        """Hypothetical Document Embeddings (HyDE)."""
        hypothetical_doc = ""
        
        if simulate:
            hypothetical_doc = f"In this hypothetical answer regarding '{query}', we outline the core concepts, definitions, and technical parameters of the system."
        else:
            prompt = f"Write a brief hypothetical paragraph answering the question: '{query}'. Respond only with the paragraph content. Do not include titles, labels, or intros."
            res = self.gemini_client.generate_response(prompt, simulate=simulate)
            if res["success"]:
                hypothetical_doc = res["text"]
            else:
                hypothetical_doc = f"Fallback answer for: {query}"

        # Retrieve documents using the hypothetical answer as the semantic search query
        chunks = self.retrieval_service.retrieve(hypothetical_doc, collection_name, top_k=top_k)
        
        return {
            "hypothetical_doc": hypothetical_doc,
            "chunks": chunks
        }

    def run_multiquery(self, query: str, collection_name: str, top_k: int, simulate: bool = False) -> Dict[str, Any]:
        """Multi-Query expansion (Query variation search fusion)."""
        queries = [query]
        
        if simulate:
            queries.append(f"expanded variation of {query}")
            queries.append(f"technical definition of {query}")
            queries.append(f"concepts related to {query}")
        else:
            prompt = (
                f"Generate 3 alternative search queries for the question: '{query}'. "
                "Provide only the alternative queries, one per line. Do not number or label them."
            )
            res = self.gemini_client.generate_response(prompt, simulate=simulate)
            if res["success"] and res["text"]:
                lines = [line.strip() for line in res["text"].split("\n") if line.strip()]
                queries.extend(lines[:3])

        # Run semantic searches for all query variations
        all_matches: Dict[str, Dict[str, Any]] = {}
        for q in queries:
            matched_chunks = self.retrieval_service.retrieve(q, collection_name, top_k=top_k)
            for chunk in matched_chunks:
                cid = chunk["id"]
                if cid not in all_matches:
                    all_matches[cid] = chunk.copy()
                else:
                    # Accumulate similarity scores cumulatively (boosting recurring documents)
                    all_matches[cid]["similarity"] = round(all_matches[cid]["similarity"] + chunk["similarity"], 4)

        # Sort combined matches by highest similarity and limit to top_k
        sorted_chunks = sorted(all_matches.values(), key=lambda x: x["similarity"], reverse=True)
        return {
            "queries_generated": queries,
            "chunks": sorted_chunks[:top_k]
        }

