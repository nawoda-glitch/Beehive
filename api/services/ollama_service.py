import requests

OLLAMA_URL = "http://localhost:11434/api/generate"

def ask_ollama(prompt):
    response = requests.post(OLLAMA_URL, json={
        "model": "bee-assistant",
        "prompt": prompt,
        "stream": False
    })

    data = response.json()

    print("🔍 Ollama response:", data)  # 👈 ADD THIS

    return data.get("response", "No response from AI")