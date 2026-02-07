from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from pathlib import Path
from dotenv import load_dotenv
import tempfile
import os

# Load .env from server directory
load_dotenv(Path(__file__).resolve().parent.parent.parent / '.env')

from storyGeneration import generate_story_from_image, generate_story_from_text
from trackConclusion import generate_conclusion, generate_community_reflection

app = FastAPI(title="Cutting Room ML Service")


# ─── Pure ML Endpoints ───────────────────────────────────────────
# These endpoints do ML work ONLY. No database writes, no track/node
# management. The Node.js server handles all orchestration.


@app.post("/api/ml/story-from-image")
async def story_from_image_endpoint(
    file: UploadFile = File(...),
    story_so_far: str = Form("")
):
    """Generate story segment directly from image."""
    # ─── Mime Type Check ───
    # Basic check, though simple extensions also work.
    if file.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
         raise HTTPException(
            status_code=400,
            detail=f"Unsupported image format '{file.content_type}'. Only JPEG and PNG are accepted."
        )

    # Read bytes directly
    image_bytes = await file.read()

    try:
        result = generate_story_from_image(image_bytes, file.content_type, story_so_far)
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/ml/story-from-text")
async def story_from_text_endpoint(body: dict):
    """Generate story segment directly from text input."""
    text = body.get("text")
    story_so_far = body.get("story_so_far", "")

    if not text:
        raise HTTPException(status_code=400, detail="text is required")

    try:
        result = generate_story_from_text(text, story_so_far)
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
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
    uvicorn.run(app, host="0.0.0.0", port=8008)