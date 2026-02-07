from pathlib import Path
from dotenv import load_dotenv
from pymongo import MongoClient
import os

# Load .env from server directory
load_dotenv(Path(__file__).resolve().parent.parent.parent / '.env')

def get_mongo_collection():
    """Get the items collection from MongoDB."""
    mongo_client = MongoClient(os.environ.get("MONGODB_URI"))
    db = mongo_client["cutting-room"]
    return db["items"]


def get_total_item_count():
    """Return total number of items in the database."""
    collection = get_mongo_collection()
    return collection.count_documents({})


def find_similar_items(embedding, user_id, limit=5, exclude_item_ids=None):
    """
    Use MongoDB Atlas Vector Search to find similar items from OTHER users.
    
    Args:
        embedding: The embedding vector to search against
        user_id: The current user's ID (to exclude their own items)
        limit: Number of similar items to return
        exclude_item_ids: List of item ObjectIds to exclude (already paired)
    
    Returns:
        List of similar item documents
    """
    collection = get_mongo_collection()

    if exclude_item_ids is None:
        exclude_item_ids = []

    # MongoDB Atlas Vector Search aggregation pipeline
    match_filter = {
        "user_id": {"$ne": user_id}  # Exclude current user's items
    }
    # Also exclude items already paired with this user
    if exclude_item_ids:
        match_filter["_id"] = {"$nin": exclude_item_ids}

    pipeline = [
        {
            "$vectorSearch": {
                "index": "item_embedding_index",  # Create this index in Atlas
                "path": "embedding",
                "queryVector": embedding,
                "numCandidates": limit * 10,
                "limit": limit + 5 + len(exclude_item_ids)  # fetch extra to compensate for exclusions
            }
        },
        {
            "$match": match_filter
        },
        {
            "$limit": limit
        },
        {
            "$project": {
                "_id": 1,
                "user_id": 1,
                "content_type": 1,
                "caption": 1,
                "description": 1,
                "text": 1,
                "score": {"$meta": "vectorSearchScore"}
            }
        }
    ]

    results = list(collection.aggregate(pipeline))
    return results