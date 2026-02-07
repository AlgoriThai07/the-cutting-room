import google.genai as genai
import google.genai.types as types
from pathlib import Path
from dotenv import load_dotenv
import os

# Load .env from server directory
load_dotenv(Path(__file__).resolve().parent.parent.parent / '.env')

client = genai.Client(api_key=os.environ.get("GOOGLE_GEMINI_API"))

STORY_PROMPT_TEMPLATE = """
You are an empathetic storyteller building a continuous narrative from a series of moments.
Your goal is to capture the internal world of the protagonist—their thoughts, anxieties, hopes, and realizations.

THE STORY SO FAR:
{story_so_far}

THIS MOMENT (What the user just added):
{user_input}

YOUR TASK:
1. **Analyze the input**:
   - If it's an image, describe what is happening and the mood.
   - If it's text, understand the thought or event.
2. **Write the NEXT SEGMENT of the story**:
   - 1-2 sentences, approx 30-50 words.
   - **Show, don't just tell**.
   - Connect the external moment to the internal journey.
   - Valid JSON output.

OUTPUT FORMAT (JSON):
{{
  "description": "A short, neutral description of the input (e.g. 'A photo of a rainy window' or 'A note about feeling lost'). Used for accessibility/display.",
  "story_segment": "The narrative continuation text."
}}
"""

def generate_story_from_text(text_content, story_so_far=""):
    """
    Generate a story segment from text input.
    """
    prompt = STORY_PROMPT_TEMPLATE.format(
        story_so_far=story_so_far if story_so_far else "(This is the beginning of the story.)",
        user_input=f"Text Note: \"{text_content}\""
    )

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json"
        )
    )
    
    # Simple parsing since we requested JSON
    import json
    try:
        return json.loads(response.text)
    except Exception as e:
        print(f"JSON parsing failed: {e}. Raw: {response.text}")
        # Fallback
        return {
            "description": "A text note.",
            "story_segment": text_content
        }

def generate_story_from_image(image_bytes, mime_type, story_so_far=""):
    """
    Generate a story segment from an image.
    """
    prompt = STORY_PROMPT_TEMPLATE.format(
        story_so_far=story_so_far if story_so_far else "(This is the beginning of the story.)",
        user_input="(Analyzed from the attached image)"
    )

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[
            types.Part.from_bytes(
                data=image_bytes,
                mime_type=mime_type,
            ),
            prompt
        ],
        config=types.GenerateContentConfig(
            response_mime_type="application/json"
        )
    )

    import json
    try:
        return json.loads(response.text)
    except Exception as e:
        print(f"JSON parsing failed: {e}. Raw: {response.text}")
        return {
            "description": "An uploaded image.",
            "story_segment": "A new moment was captured, but the words escape me."
        }