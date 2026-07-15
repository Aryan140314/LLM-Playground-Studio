import sys
import os
import json

# Ensure backend directory is in the python path to allow importing core
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from core.embeddings.embedding_service import EmbeddingService
from core.search.semantic_search import SemanticSearch

def main():
    print("--- 1. Initialization ---")
    print("Loading Embedding Service (This might take a moment to load the model)...")
    embedding_service = EmbeddingService()
    
    print("Initializing Semantic Search Engine...")
    search_engine = SemanticSearch(embedding_service)
    
    print("\n--- 2. Loading Data ---")
    data_path = os.path.join("data", "processed_documents.json")
    
    try:
        with open(data_path, "r", encoding="utf-8") as f:
            all_documents = json.load(f)
    except FileNotFoundError:
        print(f"Error: Could not find {data_path}. Please run this script from the 'backend' directory.")
        return
        
    # We will load the first 50 documents for this quick test
    test_docs = all_documents[:50]
    print(f"Loaded {len(test_docs)} documents from dataset.")
    
    print("\n--- 3. Adding to In-Memory Store ---")
    search_engine.add_documents(test_docs)
    
    print("\n--- 4. Performing Semantic Search ---")
    
    # We will test a few different queries
    queries = [
        "falling stock market and economic concerns",
        "middle east oil production and exports",
        "technology companies and computer sales"
    ]
    
    for query in queries:
        print(f"\n==================================================")
        print(f"Search Query: '{query}'")
        print(f"==================================================")
        
        # Pipeline: Embed -> Compare -> Sort -> Top K
        results = search_engine.search(query, top_k=3)
        
        for i, res in enumerate(results):
            score = res['similarity_score']
            category = res.get('category', 'Unknown')
            # Clean up content for printing
            content_preview = res['content'][:150].replace('\n', ' ') + "..."
            
            print(f"\n{i+1}. [Score: {score:.4f}] | Category: {category}")
            print(f"   {content_preview}")

if __name__ == "__main__":
    main()
