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
    embedding = client.models.embed_content(
        model="gemini-embedding-001",
        contents=text
    )

    return {
        "text": text,
        "embedding": embedding.embeddings[0].values
    }


def multipleEmbeddings(texts: list[str]):
    """
    Generate embeddings for a list of text inputs.
    
    Args:
        texts: List of text strings to embed
    
    Returns:
        List of dicts with "text" and "embedding" keys
    """
    results = []

    print(f"Processing {len(texts)} texts")

    for i, text in enumerate(texts):
        print(f"Processing [{i + 1}/{len(texts)}]: {text[:50]}...")
        try:
            result = getEmbedding(text)
            results.append(result)
        except Exception as e:
            print(f"Error processing text {i + 1}: {e}")

    return results


if __name__ == "__main__":
    # Example usage
    sample_texts = [
        "Had a great coffee at the new cafe downtown",
        "Spent the afternoon studying at the library",
        "Went for a run in the park before sunset"
    ]

    results = multipleEmbeddings(sample_texts)
    for r in results:
        print(f"Text: {r['text'][:50]}...")
        print(f"Embedding length: {len(r['embedding'])}")
        print()
