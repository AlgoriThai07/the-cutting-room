"""
Seed script — Populate the cutting-room database with captioned items
from the Sparkhack_photos folder.

Splits 18 images into 3 batches of 6 to stay under Gemini RPM limits.
Each image is sent individually for description + embedding, then inserted
into MongoDB as an Item document owned by one of 3 dummy seed users.

Usage:
    cd server/services/ml
    python seed.py
"""

import google.genai as genai
import google.genai.types as types
from pymongo import MongoClient
from bson import ObjectId
from pathlib import Path
from dotenv import load_dotenv
from datetime import datetime
import os
import time
import mimetypes

# ─── Config ───────────────────────────────────────────────────────
load_dotenv(Path(__file__).resolve().parent.parent.parent / '.env')

PHOTOS_DIR = Path(__file__).resolve().parent.parent.parent.parent.parent / 'Sparkhack_photos'
BATCH_SIZE = 6                # 18 photos ÷ 3 batches
BATCH_DELAY_SECONDS = 65      # Wait between batches to reset RPM window
INTRA_BATCH_DELAY = 5         # Small delay between images within a batch
SUPPORTED_MIME_TYPES = {'image/jpeg', 'image/png'}

# Gemini client
client = genai.Client(api_key=os.environ.get("GOOGLE_GEMINI_API"))

# MongoDB
mongo_client = MongoClient(os.environ.get("MONGODB_URI"))
db = mongo_client["cutting-room"]

# ─── Prompt (same as imgParsing.py) ───────────────────────────────
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
Do not mention the camera, photographer, or "the image"
Do not inventory objects (avoid long noun lists)
Avoid poetic metaphors and dramatic language
Avoid guessing specific identities (no age, race, or precise personal details)
Prefer grounded, observational language

Goal:
Produce a short piece of text that captures the human context and mood of the moment so that another system could compare it to similar life situations.
"""


# ─── Helpers ──────────────────────────────────────────────────────

def get_supported_images(directory: Path) -> list[Path]:
    """Return sorted list of JPEG/PNG files in the directory."""
    files = []
    for f in sorted(directory.iterdir()):
        mime, _ = mimetypes.guess_type(str(f))
        if mime and mime in SUPPORTED_MIME_TYPES:
            files.append(f)
    return files


def create_seed_users(count: int = 3) -> list[ObjectId]:
    """
    Create (or reuse) dummy seed users so items have valid user_id refs.
    Returns a list of ObjectIds.
    """
    user_ids = []
    for i in range(1, count + 1):
        username = f"seed_user_{i}"
        email = f"seed{i}@cuttingroom.dev"

        existing = db.users.find_one({"username": username})
        if existing:
            user_ids.append(existing["_id"])
            print(f"  Reusing existing seed user: {username} ({existing['_id']})")
        else:
            result = db.users.insert_one({
                "username": username,
                "email": email,
                "password_hash": None,
                "friends": [],
                "created_at": datetime.utcnow()
            })
            user_ids.append(result.inserted_id)
            print(f"  Created seed user: {username} ({result.inserted_id})")

    return user_ids


def process_single_image(image_path: Path) -> dict:
    """
    Send one image to Gemini for description, then get its embedding.
    Returns { description, embedding } or raises on failure.
    """
    mime_type, _ = mimetypes.guess_type(str(image_path))

    with open(image_path, 'rb') as f:
        image_bytes = f.read()

    # Step 1: Generate description
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[
            types.Part.from_bytes(
                data=image_bytes,
                mime_type=mime_type,
            ),
            description_prompt
        ]
    )
    description = response.text.strip()

    # Step 2: Generate embedding from description
    embed_response = client.models.embed_content(
        model="gemini-embedding-001",
        contents=description
    )
    embedding = list(embed_response.embeddings[0].values)

    return {
        "description": description,
        "embedding": embedding
    }


def insert_item(user_id: ObjectId, image_path: Path, description: str, embedding: list) -> ObjectId:
    """Insert a single item document into MongoDB."""
    doc = {
        "user_id": user_id,
        "content_type": "image",
        "content_url": str(image_path),   # local path for now; R2 URLs later
        "text": None,
        "caption": description[:90] if description else None,  # max 90 chars
        "description": description,
        "embedding": embedding,
        "created_at": datetime.utcnow()
    }
    result = db.items.insert_one(doc)
    return result.inserted_id


# ─── Main ─────────────────────────────────────────────────────────

def seed():
    print("=" * 60)
    print("  The Cutting Room — Seed Script")
    print("=" * 60)

    # 1. Collect images
    images = get_supported_images(PHOTOS_DIR)
    print(f"\nFound {len(images)} supported images in {PHOTOS_DIR}")

    if not images:
        print("No images found. Exiting.")
        return

    # 2. Create seed users (one per batch)
    num_batches = (len(images) + BATCH_SIZE - 1) // BATCH_SIZE
    print(f"\nCreating {num_batches} seed users (one per batch)...")
    user_ids = create_seed_users(num_batches)

    # 3. Split into batches
    batches = []
    for i in range(0, len(images), BATCH_SIZE):
        batches.append(images[i:i + BATCH_SIZE])

    print(f"\nSplit {len(images)} images into {len(batches)} batches of up to {BATCH_SIZE}")

    # 4. Process each batch
    total_inserted = 0
    for batch_idx, batch in enumerate(batches):
        user_id = user_ids[batch_idx]
        print(f"\n{'─' * 50}")
        print(f"  Batch {batch_idx + 1}/{len(batches)}  •  user: seed_user_{batch_idx + 1}")
        print(f"  {len(batch)} images  •  user_id: {user_id}")
        print(f"{'─' * 50}")

        for img_idx, image_path in enumerate(batch):
            filename = image_path.name
            print(f"\n  [{img_idx + 1}/{len(batch)}] Processing: {filename}")

            try:
                result = process_single_image(image_path)
                description = result["description"]
                embedding = result["embedding"]

                # Print truncated description
                preview = description[:100] + "..." if len(description) > 100 else description
                print(f"         Description: {preview}")
                print(f"         Embedding dims: {len(embedding)}")

                # Insert into MongoDB
                item_id = insert_item(user_id, image_path, description, embedding)
                print(f"         Inserted as item: {item_id}")
                total_inserted += 1

            except Exception as e:
                print(f"         ERROR: {e}")
                print(f"         Skipping {filename}")

            # Small delay between images within the batch
            if img_idx < len(batch) - 1:
                time.sleep(INTRA_BATCH_DELAY)

        # Wait between batches (except after the last one)
        if batch_idx < len(batches) - 1:
            print(f"\n  ⏳ Waiting {BATCH_DELAY_SECONDS}s before next batch (RPM cooldown)...")
            time.sleep(BATCH_DELAY_SECONDS)

    # 5. Summary
    total_items = db.items.count_documents({})
    print(f"\n{'=' * 60}")
    print(f"  Seed complete!")
    print(f"  Inserted: {total_inserted}/{len(images)} items")
    print(f"  Total items in DB: {total_items}")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    seed()
