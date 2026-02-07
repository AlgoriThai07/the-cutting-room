import google.genai as genai
from pathlib import Path
from dotenv import load_dotenv
import os

# Load .env from server directory
load_dotenv(Path(__file__).resolve().parent.parent.parent / '.env')

client = genai.Client(api_key=os.environ.get("GOOGLE_GEMINI_API"))


conclusion_prompt = """
You are writing the conclusion to someone's personal weekly story.
You are given the full story built up over the week from their daily moments.

Write 2-3 sentences (under 80 words) that:
- Wrap up the week's narrative with a reflective, warm tone
- Highlight recurring themes or growth across the week
- Feel like the ending of a short personal essay

Rules:
- Do not mention "users", "items", "database", or any technical terms
- Write in third person
- Keep it grounded and observational
"""

community_prompt = """
You are writing a brief community reflection that shows someone they are not alone.
You are given:
1. The user's completed weekly story
2. Summaries of similar tracks/stories from other anonymous users

Write 2-3 sentences (under 80 words) that:
- Acknowledge the shared human experience
- Reference the similar themes without revealing identities
- Create a sense of belonging and connection

Rules:
- Do not mention "users", "items", "database", or any technical terms
- Do not name or identify anyone
- Write in second person ("you")
- Keep it warm and uplifting
"""


def generate_conclusion(story):
    """
    Generate a concluding paragraph for the week's story.

    Args:
        story: The full story built up during the week

    Returns:
        A conclusion string (2-3 sentences)
    """
    prompt = f"""{conclusion_prompt}

---
Weekly story:
{story}

---
Write the conclusion:
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    return response.text.strip()


def generate_community_reflection(story, similar_stories):
    """
    Generate a community reflection showing the user they're not alone.

    Args:
        story: The user's completed weekly story
        similar_stories: List of anonymized stories from other users

    Returns:
        A community reflection string (2-3 sentences)
    """
    similar_text = "\n\n".join(
        [f"Anonymous story {i+1}:\n{s}" for i, s in enumerate(similar_stories) if s]
    )

    prompt = f"""{community_prompt}

---
Your weekly story:
{story}

Similar stories from the community:
{similar_text if similar_text else "(No similar stories found this week.)"}

---
Write the community reflection:
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    return response.text.strip()
