import google.genai as genai
import google.genai.types as types
from PIL import Image
from pathlib import Path
from dotenv import load_dotenv
import os

# Load .env from server directory
load_dotenv(Path(__file__).resolve().parent.parent.parent / '.env')

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

def getEmbedding(path):
    with open(path, 'rb') as f:
        image_bytes = f.read()

    # generate img description
    description = client.models.generate_content(
        model="gemini-3-flash-preview", 
        contents=[
            types.Part.from_bytes(
                data=image_bytes,
                mime_type='image/jpeg',
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
    return (embedding)


img_folder = "C:\\Users\\ngtua\\OneDrive\\Documents\\Work\\Sparkhack2026\\model\\img"
results = getEmbedding(img_folder)

