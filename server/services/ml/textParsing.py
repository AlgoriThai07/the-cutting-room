import google.genai as genai
from pathlib import Path
from dotenv import load_dotenv
import os

# Load .env from server directory
load_dotenv(Path(__file__).resolve().parent.parent.parent / '.env')


# configure client
client = genai.Client(api_key=os.environ.get("GOOGLE_GEMINI_API"))


def getEmbedding(text: str):
    """
    Generate an embedding vector for a text input.
    
    Args:
        text: The text content to embed (e.g. a review, caption, etc.)
    
    Returns:
        dict with "text" and "embedding" keys
    """
    # generate embedding
    embedding = client.models.embed_content(
        model="gemini-embedding-001",
        contents=text
    )

    return {
        "text": text,
        "embedding": list(embedding.embeddings[0].values)
    }


if __name__ == "__main__":
    sample_text = "Had a great coffee at the new cafe downtown"
    results = getEmbedding(sample_text)
    print(f"Text: {results['text']}")
    print(f"Embedding length: {len(results['embedding'])}")
