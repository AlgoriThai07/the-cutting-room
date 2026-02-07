import google.genai as genai
from pathlib import Path
from dotenv import load_dotenv
import os

# Load .env from server directory
load_dotenv(Path(__file__).resolve().parent.parent.parent / '.env')

client = genai.Client(api_key=os.environ.get("GOOGLE_GEMINI_API"))

recap_prompt = """
You are continuing a personal weekly narrative about someone's everyday life.

You are given:
1. THE STORY SO FAR — the narrative built from previous moments this week (may be empty if this is the first moment)
2. THIS MOMENT — a description of what the person just experienced
3. ECHOES (optional) — similar moments from anonymous others in the community

Your job is to write THE NEXT SENTENCE (1–2 sentences, under 50 words) that:
- CONTINUES the story naturally, as if writing the next line of a personal essay
- Picks up the thread, tone, and rhythm of the story so far
- Weaves this new moment into the ongoing arc — don't restart, don't summarize, don't repeat
- If echoes are present, subtly acknowledge the shared experience without naming anyone
- If this is the FIRST moment (no story so far), write an opening line that sets the scene

Rules:
- Write in third person
- Do NOT repeat or paraphrase what's already in the story so far
- Do NOT summarize the moment description — interpret it, absorb it, advance the narrative
- Do NOT use phrases like "Meanwhile", "In another moment", "Additionally"
- DO use transitional flow: time shifts, emotional pivots, spatial movement
- Match the tone: if the story so far is reflective, stay reflective; if it's energetic, keep momentum
- The sentence should feel incomplete without the story before it — it's a CONTINUATION, not a standalone

Goal:
Someone reading the full story (including your new sentence) should feel it was written as one coherent piece, not stitched together from separate moments.
"""


def generate_recap_sentence(user_item_description, similar_item_descriptions=None, story_so_far=""):
    """
    Generate a single recap sentence that continues the weekly narrative.
    Pure LLM call — no database access.

    Args:
        user_item_description: Description of the user's current moment
        similar_item_descriptions: List of descriptions from similar items (can be empty)
        story_so_far: The accumulated narrative from previous nodes this week

    Returns:
        A continuation sentence (1-2 sentences, under 50 words)
    """
    similar_text = ""
    if similar_item_descriptions:
        similar_text = "\n".join(
            [f"  - {desc}" for desc in similar_item_descriptions if desc]
        )

    prompt = f"""{recap_prompt}

---
THE STORY SO FAR:
{story_so_far if story_so_far else "(This is the first moment of the week — write an opening line.)"}

THIS MOMENT:
{user_item_description}

ECHOES FROM OTHERS:
{similar_text if similar_text else "(None this time.)"}

---
Write the next sentence of the story:
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    return response.text.strip()