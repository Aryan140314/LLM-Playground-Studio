from anthropic import Anthropic

from config.api_keys import ANTHROPIC_API_KEY


class ClaudeClient:

    def __init__(self):

        self.client = Anthropic(
            api_key=ANTHROPIC_API_KEY
        )

    def generate_response(self, prompt):

        response = self.client.messages.create(

            model="claude-sonnet-4-20250514",

            max_tokens=1000,

            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        return response.content[0].text