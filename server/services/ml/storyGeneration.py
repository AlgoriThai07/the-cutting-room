import google.genai as genai
from pathlib import Path
from dotenv import load_dotenv
import os

# Load .env from server directory
load_dotenv(Path(__file__).resolve().parent.parent.parent / '.env')

client = genai.Client(api_key=os.environ.get("GOOGLE_GEMINI_API"))

recap_prompt = """
You are writing a deeply personal, emotionally evolving narrative based on a series of moments.
Your goal is to capture the internal world of the protagonist—their thoughts, anxieties, hopes, and realizations.

You are given:
1. THE STORY SO FAR — the accumulated memories and feelings (may be empty at the start)
2. THIS MOMENT — a description of what they are seeing/experiencing right now
3. STAGE — where we are in the journey (Beginning, Middle, or Climax/End)

Your job is to write THE NEXT SENTENCE (1–2 sentences, under 50 words) that:
- CONTINUES the emotional arc: If they were sad, are they now finding hope? If anxious, are they finding calm or spiraling?
- Reveals the **internal monologue**: unrelated to the visual description, what are they *thinking*?
- Connects the external world (the photo description) to their internal state.
- **Deepens the narrative**: Don't just describe; interpret.

Rules:
- Write in third person, close perspective (as if inside their head).
- **Show, don't just tell** the emotion.
- If it's the **Climax/End** (Item 10 or final), bring the emotional arc to a powerful realization or turning point.
- Do NOT summarize; *advance* the feeling.

Goal:
A seamless, emotionally resonant story where the external world reflects the internal journey.
"""


def generate_recap_sentence(user_item_description, similar_item_descriptions=None, story_so_far="", item_index=0, total_items=1):
    """
    Generate a single recap sentence that continues the weekly narrative.
    Pure LLM call — no database access.

    Args:
        user_item_description: Description of the user's current moment
        similar_item_descriptions: List of descriptions from similar items (can be empty)
        story_so_far: The accumulated narrative from previous nodes this week
        item_index: The 0-based index of the current item in the sequence
        total_items: Total number of items in the sequence

    Returns:
        A continuation sentence (1-2 sentences, under 50 words)
    """
    similar_text = ""
    if similar_item_descriptions:
        similar_text = "\n".join(
            [f"  - {desc}" for desc in similar_item_descriptions if desc]
        )

    # Determine stage
    if item_index == 0:
        stage = "BEGINNING: Set the scene and the initial emotional state."
    elif item_index >= total_items - 1 or item_index >= 9: # Item 10 (index 9) or last
        stage = "CONCLUSION/END: This is the final moment. Wrap up the immediate narrative arc. Provide a sense of closure or a final realization."
    else:
        stage = "MIDDLE: Develop the theme. fluctuating emotions, deepening thoughts."

    prompt = f"""{recap_prompt}

---
STAGE:
{stage}

THE STORY SO FAR:
{story_so_far if story_so_far else "(This is the first moment — start the journey.)"}

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