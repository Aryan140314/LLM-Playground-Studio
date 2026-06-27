from transformers import pipeline


def load_text_generation_pipeline(model_name: str):
    return pipeline("text-generation", model=model_name)
