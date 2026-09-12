"""AI service integration using Groq API.

Provides AI Ticket Assistant functionality:
- Concise ticket summary
- Professional suggested customer response
Based on ticket subject, description, status, priority, and notes.
"""

import os
import sys

# Ensure backend root is on sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from services.ai_service import (
    GROQ_API_KEY,
    GROQ_MODEL,
    _get_client,
    _extract_json_from_text,
    generate_ticket_assistance,
)

__all__ = [
    "GROQ_API_KEY",
    "GROQ_MODEL",
    "_get_client",
    "_extract_json_from_text",
    "generate_ticket_assistance",
]
