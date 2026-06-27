import time
import random
from openai import OpenAI

from config.api_keys import OPENAI_API_KEY


class OpenAIClient:

    def __init__(self):
        self.client = OpenAI(
            api_key=OPENAI_API_KEY
        )

    def generate_response(self, prompt: str, simulate: bool = False):
        """
        Generate response from OpenAI
        """
        if simulate:
            start_time = time.time()
            time.sleep(random.uniform(0.6, 1.2)) # Simulate latency
            text = f"[SIMULATED GPT-4o-mini]\n\nThis is a simulated response to your request: '{prompt}'\n\nGPT-4o-mini is OpenAI's lightweight and efficient flagship sub-model, designed to be highly cost-effective and extremely fast."
            end_time = time.time()
            return {
                "success": True,
                "model": "GPT-4o-mini",
                "text": text,
                "response_time": round(end_time - start_time, 2),
                "word_count": len(text.split()),
                "character_count": len(text)
            }

        try:
            start_time = time.time()

            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )

            end_time = time.time()

            text = response.choices[0].message.content

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