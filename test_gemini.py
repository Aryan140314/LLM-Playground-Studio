from llm.gemini_client import GeminiClient

client = GeminiClient()

answer = client.generate_response(
    "Explain what a Transformer is in 5 simple sentences."
)

print(answer)