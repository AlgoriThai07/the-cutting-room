from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from pathlib import Path
from dotenv import load_dotenv
import tempfile
import os

# Load .env from server directory
load_dotenv(Path(__file__).resolve().parent.parent.parent / '.env')

from imgParsing import getEmbedding as getImageEmbedding, SUPPORTED_MIME_TYPES
from textParsing import getEmbedding as getTextEmbedding
from vectorSearch import find_similar_items
from storyGeneration import generate_recap_sentence
from trackConclusion import generate_conclusion, generate_community_reflection

app = FastAPI(title="Cutting Room ML Service")


# ─── Pure ML Endpoints ───────────────────────────────────────────
# These endpoints do ML work ONLY. No database writes, no track/node
# management. The Node.js server handles all orchestration.


@app.post("/api/ml/parse-image")
async def parse_image(
    file: UploadFile = File(...)
):
    """Parse an image → return description + embedding. No DB writes."""
    # Validate MIME type — only JPEG and PNG accepted
    if file.content_type not in SUPPORTED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported image format '{file.content_type}'. Only JPEG and PNG are accepted."
        )

    temp_path = os.path.join(tempfile.gettempdir(), file.filename)
    with open(temp_path, "wb") as f:
        f.write(await file.read())

    try:
        result = getImageEmbedding(temp_path)
        return {
            "description": result["description"],
            "embedding": result["embedding"]
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


@app.post("/api/ml/parse-text")
async def parse_text(body: dict):
    """Parse text → return embedding. No DB writes."""
    text = body.get("text")
    if not text:
        raise HTTPException(status_code=400, detail="text is required")

    try:
        result = getTextEmbedding(text)
        return {
            "text": result["text"],
            "embedding": result["embedding"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/ml/vector-search")
async def vector_search(body: dict):
    """Find similar items via vector search. Read-only DB query."""
    embedding = body.get("embedding")
    user_id = body.get("user_id")
    limit = body.get("limit", 3)
    exclude_item_ids = body.get("exclude_item_ids", [])

    if not embedding or not user_id:
        raise HTTPException(status_code=400, detail="embedding and user_id are required")

    try:
        from bson import ObjectId
        similar = find_similar_items(
            embedding=embedding,
            user_id=ObjectId(user_id),
            limit=limit,
            exclude_item_ids=[ObjectId(i) for i in exclude_item_ids]
        )
        # Serialize ObjectIds for JSON
        for item in similar:
            item["_id"] = str(item["_id"])
            item["user_id"] = str(item["user_id"])
        return {"similar_items": similar}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/ml/generate-recap")
async def generate_recap(body: dict):
    """Generate a recap sentence for a node. Pure LLM call."""
    user_description = body.get("user_item_description", "")
    similar_descriptions = body.get("similar_item_descriptions", [])
    story_so_far = body.get("story_so_far", "")

    if not user_description:
        raise HTTPException(status_code=400, detail="user_item_description is required")

    try:
        recap = generate_recap_sentence(
            user_item_description=user_description,
            similar_item_descriptions=similar_descriptions,
            story_so_far=story_so_far
        )
        return {"recap_sentence": recap}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/ml/generate-conclusion")
async def generate_conclusion_endpoint(body: dict):
    """Generate a track conclusion + community reflection. Pure LLM calls."""
    story = body.get("story", "")
    similar_stories = body.get("similar_stories", [])

    if not story:
        raise HTTPException(status_code=400, detail="story is required")

    try:
        conclusion = generate_conclusion(story)

        community_reflection = ""
        if similar_stories:
            community_reflection = generate_community_reflection(story, similar_stories)

        return {
            "conclusion": conclusion,
            "community_reflection": community_reflection
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/ml/health")
async def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)