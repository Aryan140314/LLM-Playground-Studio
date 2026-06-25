from sklearn.metrics.pairwise import cosine_similarity


def cosine_scores(vectors):
    return cosine_similarity(vectors)
