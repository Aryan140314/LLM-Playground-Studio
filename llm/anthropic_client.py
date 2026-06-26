import time
from anthropic import Anthropic

from config.api_keys import ANTHROPIC_API_KEY


class ClaudeClient:

    def __init__(self):

        self.client = Anthropic(
            api_key=ANTHROPIC_API_KEY
        )

    def generate_response(self, prompt: str):
        """
        Generate response from Claude
        """
        try:
            start_time = time.time()

            response = self.client.messages.create(
                model="claude-3-5-sonnet-latest",
                max_tokens=1000,
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )

            end_time = time.time()

            text = response.content[0].text

            return {
                "success": True,
                "model": "Claude 3.5 Sonnet",
                "text": text,
                "response_time": round(end_time - start_time, 2),
                "word_count": len(text.split()),
                "character_count": len(text)
            }

        except Exception as e:
            return {
                "success": False,
                "model": "Claude 3.5 Sonnet",
                "text": str(e),
                "response_time": 0,
                "word_count": 0,
                "character_count": 0
            }