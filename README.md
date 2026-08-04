# EquityIQ — AI-Powered Equity Research Assistant (Indian Stock Market)

EquityIQ is a full-stack, enterprise-grade AI assistant for equity research, fundamental valuation, financial news aggregation, sentiment analysis, and risk modeling focused on the **Indian Stock Market (NSE / BSE)**.

---

## 🏛️ Indian Stock Market Focus

- **Primary Exchange**: National Stock Exchange of India (NSE) & BSE
- **Supported Tickers**: RELIANCE, TCS, INFY, HDFCBANK, ICICIBANK, SBIN, LT, BHARTIARTL, ITC, AXISBANK, ASIANPAINT, MARUTI, TATAMOTORS, SUNPHARMA, WIPRO, HCLTECH, ADANIENT, ADANIPORTS, KOTAKBANK, ULTRACEMCO
- **Currency**: Indian Rupee (₹ INR)
- **Financial Notation**: Lakhs (L) and Crores (Cr)

---

## 🚀 Microservice System Architecture

1. **Frontend Dashboard (`frontend/`)**: React + Vite + Tailwind CSS featuring live debounced ticker search, interactive Recharts price series, fundamental metrics cards in INR, sentiment signal gauge, and Indian financial news feeds.
2. **Backend API Gateway (`backend/`)**: Node.js Express server providing stock search, quote, historical price series, financial fundamental metrics, news deduplication ingestion, and authentication.
3. **AI Engine Service (`ai-service/`)**: Python FastAPI service hosting serialized Machine Learning models for financial headline sentiment analysis.
4. **Database & Persistence (`mongo`)**: MongoDB container storing user profiles, indexed financial news articles, and research metadata.

---

## 🛠️ Quickstart with Docker Compose

Ensure Docker Desktop is running, then launch all microservices:

```bash
docker compose up --build -d
```

### Access Services:
- **Frontend Research Workspace**: `http://localhost:3000`
- **Backend Express API**: `http://localhost:5000/api/health`
- **FastAPI AI Engine**: `http://localhost:8000/health`
- **MongoDB Database**: `mongodb://localhost:27017`

---

## 🧪 Verification & Testing

Run full backend integration suite:
```bash
cd backend
npm test
```

Run Python AI service test suite:
```bash
cd ai-service
pytest
```

Run live system verification against running containers:
```bash
cd backend
node src/tests/system_verification.js
```
