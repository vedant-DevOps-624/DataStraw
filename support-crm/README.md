# Datastraw Support CRM

A Customer Support Ticketing CRM System built for the Datastraw Technologies AI + Tech Intern assessment.

## Tech Stack

- **Backend:** FastAPI + Python
- **Frontend:** React + Vite + Tailwind CSS
- **Database:** SQLite (via SQLAlchemy — Phase 2+)
- **AI:** Groq API (groq/compound-mini)

## Project Structure

```
support-crm/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

## Setup

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows (PowerShell):
.venv\Scripts\Activate.ps1
# macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend runs at `http://localhost:8000`

Health check: `GET http://localhost:8000/health`
API docs: `http://localhost:8000/docs`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev
```

Frontend runs at `http://localhost:5173`

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and configure as needed.

```env
DATABASE_URL=sqlite:///./data/datastraw_crm.db
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=groq/compound-mini
APP_NAME=Datastraw Support CRM
DEBUG=True
```

## License

Proprietary — Datastraw Technologies Intern Assessment
