import time
import random
from google import genai

from config.api_keys import GEMINI_API_KEY


class GeminiClient:
    """
    Gemini API Client
    """

    def __init__(self):
        self.client = genai.Client(api_key=GEMINI_API_KEY)

    def generate_response(self, prompt: str, simulate: bool = False):
        """
        Generate response from Gemini
        """
        if simulate:
            start_time = time.time()
            time.sleep(random.uniform(0.4, 0.9)) # Simulate latency
            text = f"[SIMULATED GEMINI 2.5 FLASH]\n\nHere is a simulated response to your request: '{prompt}'\n\nGemini 2.5 Flash is optimized for high-speed tasks, multimodal reasoning, and efficient generation."
            end_time = time.time()
            return {
                "success": True,
                "model": "Gemini 2.5 Flash",
                "text": text,
                "response_time": round(end_time - start_time, 2),
                "word_count": len(text.split()),
                "character_count": len(text)
            }

        try:
            start_time = time.time()

            response = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )

            end_time = time.time()

            text = response.text

            return {
                "success": True,
                "model": "Gemini 2.5 Flash",
                "text": text,
                "response_time": round(end_time - start_time, 2),
                "word_count": len(text.split()),
                "character_count": len(text)
            }

        except Exception as e:

            return {
                "success": False,
                "model": "Gemini 2.5 Flash",
                "text": str(e),
                "response_time": 0,
                "word_count": 0,
                "character_count": 0
            }