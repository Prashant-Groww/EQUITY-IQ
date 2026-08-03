# EquityIQ — AI-Powered Equity Research Assistant

EquityIQ is a full-stack, AI-powered equity research application. It brings together real-time market data, financial news, ML-driven sentiment analysis, ML-driven financial risk scoring, and a citation-backed Retrieval-Augmented Generation (RAG) chatbot grounded in SEC filings.

---

## 🏗️ System Architecture

```
React (Vite/Tailwind) ──HTTP──▶ Node/Express API ──HTTP──▶ Python/FastAPI AI Service
                                     │                              │
                                     ▼                              ▼
                              MongoDB Atlas                ChromaDB (Vector Store)
                              (users, news,                Local ML Models
                               chat history,                (sklearn/xgboost,
                               portfolio, etc.)              SHAP explainer)
                                                                     │
                                                                     ▼
                                                          Ollama (Llama 3) / OpenAI
```

- **Frontend**: React 18 (Vite) + Tailwind CSS
- **Backend API**: Node.js + Express (Port 5000)
- **AI/ML Service**: Python 3.11 + FastAPI (Port 8000)
- **Database**: MongoDB (Port 27017) + ChromaDB (Vector Store)
- **LLM/RAG**: Ollama / Llama 3 / SentenceTransformers

---

## 🚀 Quickstart

### Prerequisites
- Node.js (v18+)
- Python (v3.11+)
- Docker & Docker Compose

### Running with Docker Compose (Recommended)

```bash
docker compose up --build
```

Services will be accessible at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api/health
- **AI Service**: http://localhost:8000/health
- **MongoDB**: mongodb://localhost:27017/equityiq

### Running Services Independently

#### 1. Backend API (Node.js/Express)
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

#### 2. AI Service (Python/FastAPI)
```bash
cd ai-service
cp .env.example .env
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

#### 3. Frontend (React/Vite)
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env.example`)
| Variable | Description | Default |
|---|---|---|
| `PORT` | Node.js Express server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/equityiq` |
| `JWT_SECRET` | Secret key for JWT signing | `super-secret-key-change-in-production` |
| `AI_SERVICE_URL` | Internal FastAPI service URL | `http://localhost:8000` |

### AI Service (`ai-service/.env.example`)
| Variable | Description | Default |
|---|---|---|
| `PORT` | FastAPI server port | `8000` |
| `ALLOWED_CORS_ORIGINS` | Allowed CORS origins | `http://localhost:5000,http://localhost:3000` |
| `OLLAMA_BASE_URL` | Ollama LLM endpoint | `http://localhost:11434` |

### Frontend (`frontend/.env.example`)
| Variable | Description | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Backend Express API URL | `http://localhost:5000/api` |

---

## 🧪 Testing

- **Backend**: `cd backend && npm test`
- **AI Service**: `cd ai-service && pytest`
- **Frontend**: `cd frontend && npm run test`
