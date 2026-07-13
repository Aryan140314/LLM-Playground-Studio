"""
Prompt Builder Service

Structures the system instructions, retrieved context chunks, and user question
into a final formatted prompt block ready for LLM consumption.
"""

from typing import List, Dict, Any, Optional
import tiktoken


class PromptBuilder:
    """
    Combines user query and retrieved contexts into unified instruction prompts.
    
    NOTE: This class uses tiktoken's cl100k_base (GPT-4) tokenizer to estimate prompt 
    tokens locally. Since Gemini's official token counting API requires active API keys and 
    network requests, this serves as a baseline local proxy. Actual Gemini API token usage 
    may differ.
    """

    def __init__(self, default_instructions: Optional[str] = None):
        """
        Args:
            default_instructions: Default system directives for the model.
        """
        self.default_instructions = default_instructions or (
            "You are a helpful assistant. Answer the user's question using the provided context chunks. "
            "If the context does not contain the answer, state that you do not know. "
            "Be concise, truthful, and reference your source documents when possible."
        )
        # Note: cl100k_base (OpenAI) is used as an approximate local count to manage context length.
        # It serves as a close baseline proxy since live Gemini token counting requires network calls.
        self.encoder = tiktoken.get_encoding("cl100k_base")


    def build_prompt(
        self,
        question: str,
        contexts: List[Dict[str, Any]],
        system_instructions: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Constructs the grounded prompt payload.

        Args:
            question: User's raw prompt query.
            contexts: List of retrieved context dictionaries containing content and metadata.
            system_instructions: Custom system instruction prompt override.

        Returns:
            A dictionary containing the full constructed prompt string and character/token metrics.
        """
        instructions = system_instructions or self.default_instructions

        # Format context blocks
        context_str_list = []
        for i, ctx in enumerate(contexts):
            doc_name = ctx.get("metadata", {}).get("doc_name", "Unknown Source")
            chunk_idx = ctx.get("metadata", {}).get("chunk_index", "N/A")
            content = ctx.get("content", "")
            
            block = f"[Source: {doc_name} | Chunk: {chunk_idx}]\n{content}"
            context_str_list.append(block)

        context_block = "\n\n".join(context_str_list) if context_str_list else "No relevant context found."

        # Compile final prompt representation
        full_prompt = (
            f"System Instructions:\n{instructions}\n\n"
            f"Context:\n{context_block}\n\n"
            f"Question:\n{question}\n\n"
            f"Answer:"
        )

        return {
            "full_prompt": full_prompt,
            "system_instructions": instructions,
            "context_block": context_block,
            "question": question,
            "char_count": len(full_prompt),
            "word_count": len(full_prompt.split()),
            "token_count": len(self.encoder.encode(full_prompt))
        }
