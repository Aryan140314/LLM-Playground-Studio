from openai import OpenAI

from config.api_keys import OPENAI_API_KEY


class OpenAIClient:

    def __init__(self):

        self.client = OpenAI(
            api_key=OPENAI_API_KEY
        )

    def generate_response(self, prompt):

        response = self.client.responses.create(
            model="gpt-4.1-mini",
            input=prompt
        )

        return response.output_text