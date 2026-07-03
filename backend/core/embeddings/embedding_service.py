import logging
from typing import List
from sentence_transformers import SentenceTransformer

logger = logging.getLogger(__name__)

class EmbeddingService:
    def __init__(self, model_name: str = 'all-MiniLM-L6-v2'):
        """
        Initializes the EmbeddingService.
        
        Args:
            model_name (str): The name of the SentenceTransformer model to load.
                We use 'all-MiniLM-L6-v2' by default as it produces 384-dimensional 
                vectors and is highly optimized for semantic search.
        """
        # The model is loaded into memory when this class is instantiated.
        self.model = SentenceTransformer(model_name)

    def generate_embedding(self, text: str) -> List[float]:
        """
        Generates a 384-dimensional embedding vector for a single document.
        
        Args:
            text (str): The input text to be embedded.
            
        Returns:
            List[float]: The resulting embedding vector (384 dimensions).
        """
        # self.model.encode returns a numpy array.
        # We convert it to a standard Python list for easier JSON serialization later.
        embedding = self.model.encode(text)
        return embedding.tolist()

    def generate_batch_embeddings(self, texts: List[str]) -> List[List[float]]:
        """
        Generates embedding vectors for a batch of documents efficiently.
        
        Args:
            texts (List[str]): A list of input texts.
            
        Returns:
            List[List[float]]: A list containing the embedding vectors for each text.
        """
        # By passing a list of strings, the model automatically batches them
        # and processes them in parallel (using vectorization), which is much faster.
        embeddings = self.model.encode(texts)
        return embeddings.tolist()
