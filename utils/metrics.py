def tokens_per_second(token_count: int, elapsed_seconds: float) -> float:
    if elapsed_seconds <= 0:
        return 0.0
    return token_count / elapsed_seconds
