import time
import google.generativeai as genai

from config.api_keys import GEMINI_API_KEY


class GeminiClient:
    """
    Gemini API Client
    """

    def __init__(self):
        genai.configure(api_key=GEMINI_API_KEY)

        self.model = genai.GenerativeModel(
            "gemini-2.5-flash"
        )

    def generate_response(self, prompt: str):
        """
        Generate response from Gemini
        """

        try:
            start_time = time.time()

            response = self.model.generate_content(prompt)

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