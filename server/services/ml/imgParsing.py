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
You are writing a brief observational note about a photographed moment in everyday life.

Your task is NOT to list objects and NOT to describe the composition.
Instead, infer the lived situation happening in this scene.

Focus on:
what kind of place this is
what time or phase of the day it feels like
what people are likely doing or about to do (even if nobody is visible)
the social or emotional atmosphere of the space

Write a compact paragraph (2–4 sentences, under 90 words).

Rules:
Do not mention the camera, photographer, or “the image”
Do not inventory objects (avoid long noun lists)
Avoid poetic metaphors and dramatic language
Avoid guessing specific identities (no age, race, or precise personal details)
Prefer grounded, observational language

Goal:
Produce a short piece of text that captures the human context and mood of the moment so that another system could compare it to similar life situations.
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

