def calculate_metrics(text: str, tokens: list, ids: list) -> dict:
    """
    Calculates tokenizer metrics for the given input text, tokens, and token IDs.
    Assumes that elements of `tokens` have been decoded to strings.
    """
    token_count = len(ids)
    char_count = len(text)
    
    if token_count == 0:
        return {
            "token_count": 0,
            "char_count": char_count,
            "avg_token_len": 0.0,
            "longest_token": "",
            "longest_token_len": 0,
            "char_token_ratio": 0.0
        }
    
    # Ensure all tokens are treated as string representations
    string_tokens = [str(t) for t in tokens]
    
    token_lens = [len(t) for t in string_tokens]
    avg_token_len = sum(token_lens) / token_count
    
    longest_token = max(string_tokens, key=len) if string_tokens else ""
    longest_token_len = len(longest_token)
    
    char_token_ratio = char_count / token_count
    
    return {
        "token_count": token_count,
        "char_count": char_count,
        "avg_token_len": round(avg_token_len, 2),
        "longest_token": longest_token,
        "longest_token_len": longest_token_len,
        "char_token_ratio": round(char_token_ratio, 2)
    }
