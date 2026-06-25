import time
import google.generativeai as genai
from config.api_keys import GEMINI_API_KEY


class GeminiClient:

    def __init__(self):

        genai.configure(api_key=GEMINI_API_KEY)

        self.model = genai.GenerativeModel(
            "gemini-2.5-flash"
        )

    def generate_response(self, prompt):

        start = time.time()

        response = self.model.generate_content(prompt)

        end = time.time()

        return {

            "text": response.text,

            "response_time": round(end - start, 2),

            "word_count": len(response.text.split()),

            "character_count": len(response.text)
        }