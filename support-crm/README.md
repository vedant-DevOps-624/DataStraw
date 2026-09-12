# Datastraw Support CRM

A Customer Support Ticketing CRM System built for the Datastraw Technologies AI + Tech Intern assessment.

## Tech Stack

- **Backend:** FastAPI + Python
- **Frontend:** React + Vite + Tailwind CSS
- **Database:** SQLite (via SQLAlchemy)
- **AI:** Groq API

## Project Structure

```
support-crm/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   └── main.py          # Re-exports from main.py for Railway module path
│   ├── data/
│   │   ├── __init__.py
│   │   ├── database.py
│   │   ├── models.py
│   │   └── schemas.py
│   ├── routers/
│   │   ├── __init__.py
│   │   └── tickets.py
│   ├── services/
│   │   ├── __init__.py
│   │   └── ai_service.py
│   ├── main.py             # FastAPI app entry point
│   ├── requirements.txt
│   ├── Procfile             # Railway start command
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
├── railway.toml             # Railway deployment config
├── .gitignore
└── README.md
```

## Local Development Setup

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
PORT=8000
CORS_ORIGINS=*
```

**Never commit `.env` or any file containing secrets to version control.**

## Railway Deployment

### Prerequisites

- A Railway account
- Your GitHub repository connected to Railway
- A Groq API key from [console.groq.com](https://console.groq.com)

### Step 1: Connect GitHub Repository

1. Go to [Railway.app](https://railway.app)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your `support-crm` repository
5. Railway will automatically detect the Python project

### Step 2: Configure Root Directory

In Railway project settings:

1. Go to **Settings** → **Root Directory**
2. Set root directory to: `backend`
3. This ensures Railway installs dependencies from `backend/requirements.txt`

### Step 3: Add Environment Variables

In Railway project settings, go to **Variables** and add:

| Variable | Value |
|---|---|
| `DATABASE_URL` | `sqlite:////app/data/datastraw_crm.db` |
| `GROQ_API_KEY` | Your Groq API key |
| `GROQ_MODEL` | `groq/compound-mini` (or your preferred Groq model) |
| `PORT` | `8000` |
| `CORS_ORIGINS` | `https://your-frontend-domain.com` |
| `APP_NAME` | `Datastraw Support CRM` |
| `DEBUG` | `False` |

### Step 4: Add Persistent Volume

SQLite database must persist across deploys:

1. Go to **Settings** → **Volumes**
2. Add a new volume
3. Set **Mount Path** to: `/app/data`
4. This ensures `datastraw_crm.db` survives restarts and deploys

### Step 5: Deploy

1. Railway will automatically build and deploy
2. The build uses Nixpacks to install Python dependencies
3. The start command is: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Step 6: Verify Deployment

After deployment completes:

```bash
# Health check
curl https://your-app.up.railway.app/health

# Expected response:
# {"status": "ok"}

# API docs
# Open https://your-app.up.railway.app/docs in browser
```

### Step 7: Connect Frontend

1. Deploy your React frontend (Vercel, Netlify, or Railway static hosting)
2. Set `VITE_API_BASE_URL` to your Railway backend URL
3. Update `CORS_ORIGINS` in Railway to include your frontend domain

### Important Notes

- **SQLite Persistence:** The database file is stored at `/app/data/datastraw_crm.db` on the Railway volume
- **Port Binding:** Railway provides the `PORT` environment variable dynamically; the app reads it automatically
- **CORS:** Configure `CORS_ORIGINS` as a comma-separated list of allowed frontend origins
- **AI Service:** Groq API key is stored as a Railway environment variable and is never exposed to the frontend
- **No External Database:** SQLite is the only database; no PostgreSQL, Supabase, or other databases are used

## License

Proprietary — Datastraw Technologies Intern Assessment
