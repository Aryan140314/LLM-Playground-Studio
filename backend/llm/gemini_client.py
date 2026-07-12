import time
import random
import requests
from google import genai

from config.api_keys import GEMINI_API_KEY


class GeminiClient:
    """
    Gemini API Client
    """

    def __init__(self):
        self._client = None

    @property
    def client(self):
        if self._client is None:
            from config.api_keys import GEMINI_API_KEY
            self._client = genai.Client(api_key=GEMINI_API_KEY)
        return self._client

    def generate_response(self, prompt: str, simulate: bool = False):
        """
        Generate response from Gemini
        """
        if simulate:
            start_time = time.time()
            time.sleep(random.uniform(0.4, 0.9)) # Simulate latency
            
            # If the prompt contains a Question/Context pattern, extract the question
            # or generate a beautiful realistic response instead of echoing the raw prompt
            q_marker = "Question:\n"
            if q_marker in prompt:
                try:
                    question = prompt.split(q_marker)[1].split("\n")[0].strip()
                except Exception:
                    question = "your query"
            else:
                question = prompt[:100] + "..." if len(prompt) > 100 else prompt

            text = (
                f"[SIMULATED GEMINI 2.5 FLASH]\n\n"
                f"Based on retrieved context, here is a simulated response to your question: \"{question}\"\n\n"
                f"The hybrid retrieval layer matched relevant passages from the corpus. Since you are running in Simulation Mode, "
                f"this mock response is generated to save your API quota. Toggle Live API Mode in the sidebar footer to query the real Gemini model."
            )
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

        except Exception as sdk_err:
            # Fallback to direct HTTP request with x-goog-api-key header
            # to bypass SDK OAuth conflicts or ambient credential bugs
            try:
                start_time = time.time()
                url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
                from config.api_keys import GEMINI_API_KEY
                headers = {
                    "x-goog-api-key": GEMINI_API_KEY,
                    "Content-Type": "application/json"
                }
                payload = {
                    "contents": [{"parts": [{"text": prompt}]}]
                }

                resp = requests.post(url, json=payload, headers=headers, timeout=30)
                end_time = time.time()

                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates and candidates[0].get("content", {}).get("parts"):
                        text = candidates[0]["content"]["parts"][0]["text"]
                        return {
                            "success": True,
                            "model": "Gemini 2.5 Flash (HTTP Fallback)",
                            "text": text,
                            "response_time": round(end_time - start_time, 2),
                            "word_count": len(text.split()),
                            "character_count": len(text)
                        }

                raise Exception(f"HTTP Status {resp.status_code}: {resp.text}")

            except Exception as http_err:
                return {
                    "success": False,
                    "model": "Gemini 2.5 Flash",
                    "text": f"SDK Error: {str(sdk_err)} | Fallback Error: {str(http_err)}",
                    "response_time": 0,
                    "word_count": 0,
                    "character_count": 0
                }