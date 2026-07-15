import json
import os
import sys

# Ensure backend directory is in the python path to allow importing core
sys.path.append(os.path.dirname(os.path.abspath(__name__)))

from core.embeddings.embedding_service import EmbeddingService

def main():
    data_path = os.path.join("data", "processed_documents.json")
    
    print(f"Loading documents from {data_path}...")
    try:
        with open(data_path, "r", encoding="utf-8") as f:
            documents = json.load(f)
    except FileNotFoundError:
        print(f"Error: Could not find {data_path}. Please run this script from the 'backend' directory.")
        return

    # Test only on 10 documents as requested
    test_docs = documents[:10]
    print(f"Loaded {len(test_docs)} documents for testing.")
    
    print("\nInitializing Embedding Service (This might take a moment to load the model)...")
    service = EmbeddingService()
    
    # We will combine the document title and description to create the text to embed
    texts_to_embed = [f"{doc['title']}. {doc['content']}" for doc in test_docs]
    
    print("\n--- 1. Testing Single Embedding ---")
    single_text = texts_to_embed[0]
    single_embedding = service.generate_embedding(single_text)
    print(f"Text Preview: {single_text[:75]}...")
    print(f"Generated Vector Length: {len(single_embedding)} dimensions")
    print(f"Vector Sample (first 5 dimensions): {single_embedding[:5]}")
    
    print("\n--- 2. Testing Batch Embeddings ---")
    print(f"Generating embeddings for {len(texts_to_embed)} documents at once...")
    batch_embeddings = service.generate_batch_embeddings(texts_to_embed)
    print(f"Successfully processed {len(batch_embeddings)} texts.")
    print(f"Vector Length of 2nd item: {len(batch_embeddings[1])} dimensions")
    print(f"Vector Sample of 2nd item (first 5 dimensions): {batch_embeddings[1][:5]}")

if __name__ == "__main__":
    main()
