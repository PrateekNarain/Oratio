import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

# Configure API
genai.configure(api_key=os.environ.get("GOOGLE_API_KEY"))

print("Testing Gemini API and listing available models...\n")

try:
    # List all available models
    print("Available models:")
    for model in genai.list_models():
        if 'generateContent' in model.supported_generation_methods:
            print(f"  - {model.name}")
            print(f"    Display name: {model.display_name}")
            print(f"    Description: {model.description}")
            print()
except Exception as e:
    print(f"Error listing models: {e}")
    print()

# Test different model names
test_models = [
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-pro",
    "models/gemini-1.5-flash",
]

print("\nTesting model availability:")
for model_name in test_models:
    try:
        model = genai.GenerativeModel(model_name)
        response = model.generate_content("Say 'Hello' if you can hear me.")
        print(f"✓ {model_name}: WORKS - Response: {response.text[:50]}")
    except Exception as e:
        print(f"✗ {model_name}: FAILED - {str(e)[:100]}")
