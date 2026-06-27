import tiktoken
from transformers import AutoTokenizer

# Global memory cache for loaded tokenizers to speed up consecutive runs
_TOKENIZER_CACHE = {}

def get_tiktoken_encoding(encoding_name: str = "cl100k_base"):
    """
    Loads and caches a tiktoken encoding.
    """
    key = f"tiktoken_{encoding_name}"
    if key not in _TOKENIZER_CACHE:
        _TOKENIZER_CACHE[key] = tiktoken.get_encoding(encoding_name)
    return _TOKENIZER_CACHE[key]

def get_hf_tokenizer(model_name: str):
    """
    Loads and caches a Hugging Face AutoTokenizer.
    """
    key = f"hf_{model_name}"
    if key not in _TOKENIZER_CACHE:
        _TOKENIZER_CACHE[key] = AutoTokenizer.from_pretrained(model_name)
    return _TOKENIZER_CACHE[key]

def tokenize_gpt(text: str, encoding_name: str = "cl100k_base") -> dict:
    """
    Tokenizes text using tiktoken (BPE) and returns tokens, IDs, vocab size, and algorithm metadata.
    """
    try:
        encoder = get_tiktoken_encoding(encoding_name)
        ids = encoder.encode(text)
        
        # Convert IDs back to individual token string representations safely
        raw_tokens = [encoder.decode_single_token_bytes(i) for i in ids]
        tokens = [b.decode("utf-8", errors="replace") for b in raw_tokens]
        
        return {
            "tokens": tokens,
            "ids": ids,
            "vocab_size": encoder.n_vocab,
            "algorithm": "BPE (Byte-Pair Encoding)",
            "success": True,
            "error": None
        }
    except Exception as e:
        return {
            "tokens": [],
            "ids": [],
            "vocab_size": 0,
            "algorithm": "BPE (Byte-Pair Encoding)",
            "success": False,
            "error": str(e)
        }

def tokenize_hf(text: str, model_name: str, algorithm_name: str, include_special_tokens: bool = True) -> dict:
    """
    Tokenizes text using a Hugging Face AutoTokenizer and returns tokens, IDs, vocab size, and algorithm metadata.
    """
    try:
        tokenizer = get_hf_tokenizer(model_name)
        
        # Hugging Face tokenizers support add_special_tokens
        ids = tokenizer.encode(text, add_special_tokens=include_special_tokens)
        tokens = tokenizer.convert_ids_to_tokens(ids)
        
        # Stringify tokens to avoid any non-string representations (e.g. None or binary representation)
        tokens = [str(t) for t in tokens]
        
        return {
            "tokens": tokens,
            "ids": ids,
            "vocab_size": tokenizer.vocab_size,
            "algorithm": algorithm_name,
            "success": True,
            "error": None
        }
    except Exception as e:
        return {
            "tokens": [],
            "ids": [],
            "vocab_size": 0,
            "algorithm": algorithm_name,
            "success": False,
            "error": str(e)
        }

def get_tokenizer_data(text: str, tokenizer_type: str, model_name: str, include_special_tokens: bool = True) -> dict:
    """
    Unified entry point to get tokenization data for GPT, BERT, and SentencePiece tokenizers.
    """
    if tokenizer_type == "gpt":
        return tokenize_gpt(text, encoding_name=model_name)
    elif tokenizer_type == "bert":
        return tokenize_hf(
            text, 
            model_name=model_name, 
            algorithm_name="WordPiece", 
            include_special_tokens=include_special_tokens
        )
    elif tokenizer_type == "sentencepiece":
        return tokenize_hf(
            text, 
            model_name=model_name, 
            algorithm_name="SentencePiece (Unigram/BPE)", 
            include_special_tokens=include_special_tokens
        )
    else:
        raise ValueError(f"Unknown tokenizer type: {tokenizer_type}")
