"""
Demo Pipeline — Create nodes, chain stories, and conclude tracks
directly from seeded items in MongoDB.

Skips vector search (similar_item_ids left empty).
Focuses on: node creation → story chaining via storyGeneration → track conclusion.

Processes each seed user's items in batches to stay under Gemini RPM limits.

Usage:
    cd server/services/ml
    python demoPipeline.py
"""

import google.genai as genai
from pymongo import MongoClient
from bson import ObjectId
from pathlib import Path
from dotenv import load_dotenv
from datetime import datetime
import os
import time

# ─── Config ───────────────────────────────────────────────────────
load_dotenv(Path(__file__).resolve().parent.parent.parent / '.env')

BATCH_SIZE = 6                # items per LLM batch before cooldown
BATCH_DELAY_SECONDS = 65      # RPM cooldown between batches
INTRA_DELAY_SECONDS = 65      # 1 minute delay between individual LLM calls

# MongoDB
mongo_client = MongoClient(os.environ.get("MONGODB_URI"))
db = mongo_client["cutting-room"]

# Gemini (used by imported modules, but also here for conclusion)
client = genai.Client(api_key=os.environ.get("GOOGLE_GEMINI_API"))

# Import the ML functions
from storyGeneration import generate_recap_sentence
from trackConclusion import generate_conclusion, generate_community_reflection


# ─── Helpers ──────────────────────────────────────────────────────

def get_week_id():
    """Get current ISO week string e.g. '2026-W06'."""
    iso = datetime.now().isocalendar()
    return f"{iso[0]}-W{iso[1]:02d}"


def get_seed_users():
    """Get all seed users from the database."""
    users = list(db.users.find({"username": {"$regex": "^seed_user_"}}))
    print(f"Found {len(users)} seed users")
    return users


def get_user_items(user_id):
    """Get all items for a user, sorted by creation time."""
    items = list(db.items.find({"user_id": user_id}).sort("created_at", 1))
    return items


def rate_limited_call(fn, call_count, *args, **kwargs):
    """
    Execute an LLM call with rate limiting.
    Pauses for BATCH_DELAY_SECONDS every BATCH_SIZE calls.
    Returns (result, new_call_count).
    """
    if call_count > 0 and call_count % BATCH_SIZE == 0:
        print(f"\n  ⏳ RPM cooldown ({BATCH_DELAY_SECONDS}s) after {call_count} LLM calls...")
        time.sleep(BATCH_DELAY_SECONDS)
    else:
        time.sleep(INTRA_DELAY_SECONDS)

    result = fn(*args, **kwargs)
    return result, call_count + 1


# ─── Pipeline per user ───────────────────────────────────────────

def process_user(user, all_stories, call_count):
    """
    For one seed user:
    1. Create a Track
    2. For each of their items, create a Node with a recap sentence
    3. Chain the recap sentences into a rolling story
    4. Conclude the track

    Returns (track_doc, call_count).
    """
    user_id = user["_id"]
    username = user["username"]
    items = get_user_items(user_id)

    print(f"\n{'═' * 55}")
    print(f"  Processing: {username}  ({len(items)} items)")
    print(f"{'═' * 55}")

    if not items:
        print("  No items found, skipping.")
        return None, call_count

    week_id = get_week_id()

    # Create track
    track = {
        "user_id": user_id,
        "week_id": week_id,
        "node_ids": [],
        "story": "",
        "community_reflection": "",
        "concluded": False,
        "created_at": datetime.utcnow()
    }
    track_result = db.tracks.insert_one(track)
    track_id = track_result.inserted_id
    print(f"  Created track: {track_id}")

    story_so_far = ""
    previous_node_id = None

    # Create nodes — one per item
    for idx, item in enumerate(items):
        item_id = item["_id"]
        description = item.get("description", "") or ""
        filename = item.get("content_url", "unknown")
        if isinstance(filename, str) and ('\\' in filename or '/' in filename):
            filename = Path(filename).name

        print(f"\n  [{idx + 1}/{len(items)}] {filename}")
        print(f"         Desc: {description[:80]}{'...' if len(description) > 80 else ''}")

        # Generate recap sentence (no similar items — empty list)
        try:
            recap, call_count = rate_limited_call(
                generate_recap_sentence,
                call_count,
                user_item_description=description,
                similar_item_descriptions=[],
                story_so_far=story_so_far
            )
            recap = recap.strip()
        except Exception as e:
            print(f"         ERROR generating recap: {e}")
            recap = ""
        
        print(f"         Recap: {recap}")

        # Create node document
        node = {
            "user_id": user_id,
            "user_item_id": item_id,
            "previous_node_id": previous_node_id,
            "similar_item_ids": [],        # Skipping vector search
            "recap_sentence": recap,
            "week_id": week_id,
            "created_at": datetime.utcnow()
        }
        node_result = db.nodes.insert_one(node)
        node_id = node_result.inserted_id
        previous_node_id = node_id

        # Update rolling story
        story_so_far = f"{story_so_far} {recap}".strip()

        # Update track with new node
        db.tracks.update_one(
            {"_id": track_id},
            {
                "$push": {"node_ids": node_id},
                "$set": {"story": story_so_far}
            }
        )

        print(f"         Node: {node_id}  (track now has {idx + 1} nodes)")

        # Print the full story so far
        print(f"\n  ┌─ Story so far ({'─' * 35})")
        for line in story_so_far.split(". "):
            line = line.strip()
            if line:
                if not line.endswith("."):
                    line += "."
                print(f"  │  {line}")
        print(f"  └{'─' * 50}\n")

    # ─── Conclude the track ───────────────────────────────────
    print(f"\n  {'─' * 45}")
    print(f"  Concluding track for {username}...")

    # Generate conclusion
    try:
        conclusion, call_count = rate_limited_call(
            generate_conclusion,
            call_count,
            story_so_far
        )
        concluded_story = f"{story_so_far}\n\n{conclusion}"
        print(f"  Conclusion: {conclusion[:100]}{'...' if len(conclusion) > 100 else ''}")
    except Exception as e:
        print(f"  ERROR generating conclusion: {e}")
        concluded_story = story_so_far
        conclusion = ""

    # Generate community reflection using other users' stories
    community_reflection = ""
    other_stories = [s for s in all_stories if s]  # stories from previously processed users
    if other_stories:
        try:
            community_reflection, call_count = rate_limited_call(
                generate_community_reflection,
                call_count,
                story_so_far,
                other_stories[:3]
            )
            print(f"  Community:  {community_reflection[:100]}{'...' if len(community_reflection) > 100 else ''}")
        except Exception as e:
            print(f"  ERROR generating community reflection: {e}")

    # Finalize track in DB
    db.tracks.update_one(
        {"_id": track_id},
        {
            "$set": {
                "story": concluded_story,
                "community_reflection": community_reflection,
                "concluded": True
            }
        }
    )

    print(f"  ✓ Track {track_id} concluded")

    return concluded_story, call_count


# ─── Main ─────────────────────────────────────────────────────────

def main():
    print("=" * 60)
    print("  The Cutting Room — Demo Pipeline")
    print("  Node creation → Story chaining → Track conclusion")
    print("=" * 60)

    # Clean previous demo data (nodes + tracks only, keep items)
    deleted_nodes = db.nodes.delete_many({})
    deleted_tracks = db.tracks.delete_many({})
    print(f"\nCleaned up: {deleted_nodes.deleted_count} old nodes, {deleted_tracks.deleted_count} old tracks")

    users = get_seed_users()
    if not users:
        print("No seed users found. Run seed.py first.")
        return

    total_items = db.items.count_documents({})
    print(f"Total items in DB: {total_items}")

    all_stories = []
    call_count = 0

    for user in users:
        story, call_count = process_user(user, all_stories, call_count)
        if story:
            all_stories.append(story)

    # ─── Final summary ────────────────────────────────────────
    print(f"\n{'=' * 60}")
    print(f"  Pipeline complete!")
    print(f"  Total LLM calls: {call_count}")
    print(f"  Tracks created: {db.tracks.count_documents({})}")
    print(f"  Nodes created:  {db.nodes.count_documents({})}")
    print(f"{'=' * 60}")

    # Print all final stories
    print(f"\n{'=' * 60}")
    print(f"  GENERATED STORIES")
    print(f"{'=' * 60}")

    for track in db.tracks.find({}):
        user = db.users.find_one({"_id": track["user_id"]})
        username = user["username"] if user else "unknown"
        print(f"\n┌─ {username} (week {track['week_id']}) ─────────────")
        print(f"│")
        for line in (track.get("story") or "").split("\n"):
            if line.strip():
                print(f"│  {line.strip()}")
        print(f"│")
        if track.get("community_reflection"):
            print(f"│  🌐 Community: {track['community_reflection']}")
            print(f"│")
        print(f"└─ concluded: {track.get('concluded', False)}")
        print()


if __name__ == "__main__":
    main()
