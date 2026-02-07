import google.genai as genai
import google.genai.types as types
from pathlib import Path
from dotenv import load_dotenv
import os
import mimetypes

# Load .env from server directory
load_dotenv(Path(__file__).resolve().parent.parent.parent / '.env')

SUPPORTED_MIME_TYPES = {'image/jpeg', 'image/png'}

description_prompt = """
You are an empathetic storyteller. Your task is to analyze this photo for both its artistic qualities and its deeper meaning.

Focus on:
1. **The content**: What is happening, but more importantly, what it *means*.
2. **The feeling**: The mood, atmosphere, and emotions evoked by the scene.
3. **The story**: Who is the person behind the camera? What were they **thinking**, feeling, or seeing that made them capture this moment?

Rules:
- Do not just list objects; explain their significance to the moment.
- Capture the *lived experience* and *internal monologue* of the photographer.
- Use evocative, grounded language.
- Keep it concise (under 100 words).

Goal:
Produce a short piece of text that captures the context, mood, and the human story behind the lens.
"""


# configure client
client = genai.Client(api_key=os.environ.get("GOOGLE_GEMINI_API"))


def detect_mime_type(path):
    """Detect MIME type from file extension. Returns None if unsupported."""
    mime_type, _ = mimetypes.guess_type(path)
    if mime_type and mime_type in SUPPORTED_MIME_TYPES:
        return mime_type
    return None


def getEmbedding(path):
    mime_type = detect_mime_type(path)
    if mime_type is None:
        ext = os.path.splitext(path)[1]
        raise ValueError(
            f"Unsupported image format '{ext}'. Only JPEG and PNG are accepted."
        )

    with open(path, 'rb') as f:
        image_bytes = f.read()

    # generate img description
    description = client.models.generate_content(
        model="gemini-2.5-flash", 
        contents=[
            types.Part.from_bytes(
                data=image_bytes,
                mime_type=mime_type,
            ),
            description_prompt
        ]
    )
    print(description.text)

    # generate embedding
    embedding = client.models.embed_content(
        model="gemini-embedding-001",
        contents=description.text
    )

    return {
        "description": description.text,
        "embedding": list(embedding.embeddings[0].values)
    }


if __name__ == "__main__":
    img_folder = r"C:\Users\ngtua\OneDrive\Documents\Work\Sparkhack2026\model\img"
    results = getEmbedding(img_folder)
    print(results)

