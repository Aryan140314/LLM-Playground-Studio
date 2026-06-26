import time
from openai import OpenAI

from config.api_keys import OPENAI_API_KEY


class OpenAIClient:

    def __init__(self):

        self.client = OpenAI(
            api_key=OPENAI_API_KEY
        )

    def generate_response(self, prompt: str):
        """
        Generate response from OpenAI
        """
        try:
            start_time = time.time()

            response = self.client.responses.create(
                model="gpt-4o-mini",
                input=prompt
            )

            end_time = time.time()

            text = response.output_text

            return {
                "success": True,
                "model": "GPT-4o-mini",
                "text": text,
                "response_time": round(end_time - start_time, 2),
                "word_count": len(text.split()),
                "character_count": len(text)
            }

        except Exception as e:
            return {
                "success": False,
                "model": "GPT-4o-mini",
                "text": str(e),
                "response_time": 0,
                "word_count": 0,
                "character_count": 0
            }