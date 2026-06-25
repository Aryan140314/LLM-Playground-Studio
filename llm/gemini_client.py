import time
import google.generativeai as genai

from config.api_keys import GEMINI_API_KEY


class GeminiClient:
    def __init__(self):
        genai.configure(api_key=GEMINI_API_KEY)

        self.model = genai.GenerativeModel(
            "gemini-2.5-flash"
        )

    def generate_response(self, prompt: str):

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