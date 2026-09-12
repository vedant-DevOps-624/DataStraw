import os
import json
import re
from dotenv import load_dotenv

load_dotenv()

from groq import Groq, APIStatusError, APIConnectionError, AuthenticationError, RateLimitError

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "groq/compound-mini")


def _get_client() -> Groq:
    """Instantiate and return an authenticated Groq client.

    Raises:
        RuntimeError: If GROQ_API_KEY is not set in the environment.
    """
    load_dotenv()
    api_key = os.getenv("GROQ_API_KEY") or GROQ_API_KEY
    if not api_key:
        raise RuntimeError(
            "GROQ_API_KEY is not configured. "
            "Set it in backend/.env and restart the server."
        )
    # The Groq SDK reads the key we pass explicitly; it never reaches the frontend.
    return Groq(api_key=api_key)


def _extract_json_from_text(text: str) -> dict:
    """Extract the first JSON object found in *text*.

    Raises:
        ValueError: If no valid JSON object is found.
    """
    text = text.strip()
    # Strip thinking blocks if model uses them
    text = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL).strip()
    # Strip markdown code block wrappers if present
    if text.startswith("```json"):
        text = text[len("```json"):].strip()
    elif text.startswith("```"):
        text = text[len("```"):].strip()
    if text.endswith("```"):
        text = text[:-3].strip()

    match = re.search(r"\{.*\}", text, re.DOTALL)
    if not match:
        raise ValueError("No JSON object found in AI response")
    try:
        return json.loads(match.group(0))
    except json.JSONDecodeError as exc:
        raise ValueError(f"Invalid JSON in AI response: {exc}") from exc


def generate_ticket_assistance(ticket, notes: list) -> dict:
    """Generate an AI-assisted summary and suggested response for *ticket*.

    Args:
        ticket: SQLAlchemy Ticket model instance.
        notes:  List of SQLAlchemy Note model instances associated with the ticket.

    Returns:
        dict with keys ``summary`` and ``suggested_response``.

    Raises:
        RuntimeError: For configuration errors or AI provider failures.
    """
    client = _get_client()

    notes_text = "\n".join(
        f"- {note.created_at.strftime('%Y-%m-%d %H:%M')}: {note.note_text}"
        for note in notes
    ) or "No notes yet."

    system_message = (
        "You are a customer support assistant. "
        "Your job is to help support agents quickly understand tickets and craft professional replies. "
        "Only use information explicitly provided — do not invent facts. "
        "Always respond with ONLY a valid JSON object and no other text."
    )

    user_message = (
        "Given the following support ticket details, provide:\n"
        "1. A concise 2–3 sentence summary of the issue.\n"
        "2. A professional suggested response to the customer.\n\n"
        "⚠️  This output is AI-generated and requires human review before sending.\n\n"
        "Respond with ONLY a JSON object in this exact format:\n"
        '{"summary": "...", "suggested_response": "..."}\n\n'
        f"Subject: {ticket.subject}\n"
        f"Description: {ticket.description}\n"
        f"Status: {ticket.status}\n"
        f"Priority: {ticket.priority}\n"
        f"Notes:\n{notes_text}\n"
    )

    model = os.getenv("GROQ_MODEL") or GROQ_MODEL or "groq/compound-mini"
    try:
        chat_completion = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_message},
            ],
            temperature=0.4,
            max_tokens=1024,
            timeout=30,
        )

        text = chat_completion.choices[0].message.content or ""
        data = _extract_json_from_text(text)

        if "summary" not in data or "suggested_response" not in data:
            raise ValueError("Missing required keys in AI response")

        return {
            "summary": str(data.get("summary", "")).strip(),
            "suggested_response": str(data.get("suggested_response", "")).strip(),
        }

    except RuntimeError:
        # Re-raise configuration errors (missing API key) unchanged.
        raise

    except AuthenticationError:
        raise RuntimeError(
            "AI service authentication failed. "
            "Check that GROQ_API_KEY is valid."
        )

    except RateLimitError:
        raise RuntimeError(
            "AI service rate limit reached. Please wait a moment and try again."
        )

    except APIConnectionError as exc:
        raise RuntimeError(
            f"Could not connect to AI service: {exc}"
        ) from exc

    except APIStatusError as exc:
        raise RuntimeError(
            f"AI service returned an error (HTTP {exc.status_code}). "
            "Please try again later."
        ) from exc

    except (ValueError, Exception) as exc:
        raise RuntimeError(f"AI generation failed: {exc}") from exc
