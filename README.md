# EquityIQ — Enterprise AI-Powered Equity Research Assistant (Indian Stock Market)

EquityIQ is a full-stack, enterprise-grade AI assistant for equity research, fundamental valuation, financial news aggregation, sentiment analysis, quantitative risk modeling, corporate document extraction, RAG semantic search, interactive copilot assistance, portfolio analytics, custom price alerting, and research report exporting focused on the **Indian Stock Market (NSE / BSE in ₹ INR)**.

---

## 🏛️ Indian Stock Market Focus

- **Primary Exchanges**: National Stock Exchange of India (NSE) & Bombay Stock Exchange (BSE)
- **Supported Tickers**: RELIANCE, TCS, INFY, HDFCBANK, ICICIBANK, SBIN, LT, BHARTIARTL, ITC, AXISBANK, ASIANPAINT, MARUTI, TATAMOTORS, SUNPHARMA, WIPRO, HCLTECH, ADANIENT, ADANIPORTS, KOTAKBANK, ULTRACEMCO, etc.
- **Currency & Financial Notation**: Indian Rupee (₹ INR), Lakhs (L), and Crores (Cr)
- **Benchmark Index**: Nifty 50 (Risk Beta & Relative Volatility)

---

## 🚀 Microservice Architecture

1. **React Frontend Workspace (`frontend/`)**: React + Vite + Tailwind CSS dashboard featuring live price series charts, financial metrics grid, portfolio & watchlist manager, AI rebalancing advisor, custom price alert engine, interactive AI chat copilot, RAG filing retriever, report upload processor, sentiment analyzer, and research brief PDF exporter.
2. **Node.js Express API Gateway (`backend/`)**: Express API server managing authentication, live Yahoo v8 NSE stock quote engine, news ingestion & deduplication, portfolio holdings valuation, custom rule triggers, and forwarding requests to the Python AI engine.
3. **Python FastAPI AI Engine (`ai-service/`)**: FastAPI microservice hosting:
   - ML News Sentiment Classifier (TF-IDF + Scikit-Learn)
   - ML Quantitative Risk & Volatility Model (GradientBoostingRegressor)
   - Filing Extractor & Document NLP Summarizer
   - RAG Vector Store & Cosine Similarity Context Retriever (ChromaDB + Cosine Similarity)
   - Intent-aware Conversational AI Chat Copilot Engine
   - Portfolio Diversification & Rebalancing Optimization Service
   - Executive Equity Research Brief Synthesizer
4. **Database Container (`mongo`)**: MongoDB 7.0 container persisting user accounts, indexed news articles, uploaded corporate filings, portfolio holdings, watchlists, and alert rules.

---

## 🛠️ Complete 12-Phase Roadmap Status

| Phase | System Module | Status |
| :--- | :--- | :--- |
| **Phase 1** | Monorepo Setup & Docker Infrastructure | ✅ Completed |
| **Phase 2** | MongoDB Persistence & JWT Authentication | ✅ Completed |
| **Phase 3** | Indian Stock Market Real-Time Data Engine (NSE/BSE) | ✅ Completed |
| **Phase 4** | Financial News Ingestion & Deduplication | ✅ Completed |
| **Phase 5** | ML News Headline Sentiment Classifier | ✅ Completed |
| **Phase 6** | ML Risk & Quantitative Volatility Model | ✅ Completed |
| **Phase 7** | Corporate Filing NLP Extraction & Summarizer | ✅ Completed |
| **Phase 8** | RAG Vector Knowledge Indexing & Semantic Search | ✅ Completed |
| **Phase 9** | AI Chat Assistant (Interactive Research Copilot) | ✅ Completed |
| **Phase 10** | Portfolio Management, Watchlist & AI Rebalancing Advisor | ✅ Completed |
| **Phase 11** | Custom Alert Engine & Research Brief Exporter | ✅ Completed |
| **Phase 12** | **Production Hardening, E2E Verification & Deployment** | ✅ **Completed** |

---

## ⚡ Quickstart with Docker Compose

Ensure Docker Desktop is running, then launch all microservices in production mode:

```bash
# Launch production stack
docker compose -f docker-compose.prod.yml up --build -d
```

### Access Microservices:
- **Frontend Research Workspace**: `http://localhost:80` (or `http://localhost:3000` in dev)
- **Backend Express API**: `http://localhost:5000/api/health`
- **FastAPI AI Engine**: `http://localhost:8000/health`
- **MongoDB Database**: `mongodb://localhost:27017`

---

## 🧪 Comprehensive Verification & Testing

Run Python AI Service test suite (12/12 unit tests):
```bash
cd ai-service
pytest
```

Run Backend integration test suite (44/44 integration tests across 12 test suites):
```bash
cd backend
npm test
```

Run Live 12-Feature System Verification:
```bash
cd backend
node src/tests/system_verification.js
```

Build Frontend Production Assets:
```bash
cd frontend
npm run build
```
