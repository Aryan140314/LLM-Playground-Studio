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

        except Exception as sdk_err:
            # Fallback to direct HTTP request with x-goog-api-key header
            # to bypass SDK OAuth conflicts or ambient credential bugs
            try:
                start_time = time.time()
                url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
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
