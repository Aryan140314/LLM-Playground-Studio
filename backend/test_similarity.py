import sys
import os

# Ensure backend directory is in the python path to allow importing core
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from core.embeddings.embedding_service import EmbeddingService
from core.embeddings.similarity import cosine_similarity, dot_product

def main():
    print("Loading Embedding Service...")
    # Initialize the embedding service
    service = EmbeddingService()
    
    # We will test similarity with three pairs of sentences:
    # 1. Exactly the same
    # 2. Similar meaning, different words
    # 3. Completely unrelated
    sentence_pairs = [
        ("The cat sits on the mat.", "The cat sits on the mat."),
        ("The cat sits on the mat.", "The feline is resting on a rug."),
        ("The cat sits on the mat.", "A rocket was launched into space."),
    ]
    
    print("\n--- Testing Similarity Scores ---")
    for sentence_a, sentence_b in sentence_pairs:
        print(f"\nSentence A: '{sentence_a}'")
        print(f"Sentence B: '{sentence_b}'")
        
        # 1. Generate Embeddings for both sentences
        emb_a = service.generate_embedding(sentence_a)
        emb_b = service.generate_embedding(sentence_b)
        
        # 2. Calculate Similarity Scores
        cos_sim = cosine_similarity(emb_a, emb_b)
        dot_prod = dot_product(emb_a, emb_b)
        
        print(f"  -> Cosine Similarity: {cos_sim:.4f}")
        print(f"  -> Dot Product:       {dot_prod:.4f}")

if __name__ == "__main__":
    main()
