# EquityIQ — Enterprise AI-Powered Equity Research Assistant (Indian Stock Market)

EquityIQ is a full-stack, enterprise-grade AI assistant for Indian equity research, fundamental valuation, stock search, ML stock rating, financial news aggregation, sentiment analysis, quantitative risk modeling, corporate document extraction, RAG semantic search, interactive copilot assistance, and research report exporting focused on the **Indian Stock Market (NSE / BSE in ₹ INR)**.

---

## 🏛️ Indian Stock Market Focus

- **Primary Exchanges**: National Stock Exchange of India (NSE) & Bombay Stock Exchange (BSE)
- **Supported Tickers**: 2,600+ authentic NSE-listed equities (All listed shares on the National Stock Exchange of India) covering Nifty 50, Nifty Next 50, Nifty Midcap 150, and Nifty Smallcap 250 (TCS, RELIANCE, INFY, HDFCBANK, ICICIBANK, SBIN, LT, BHARTIARTL, ITC, AXISBANK, ASIANPAINT, MARUTI, TATAMOTORS, SUNPHARMA, WIPRO, HCLTECH, ADANIENT, ELECON, BHEL, etc.).
- **Currency & Financial Notation**: Indian Rupee (₹ INR), Lakhs (L), and Crores (Cr)
- **Benchmark Index**: Nifty 50 (Risk Beta & Relative Market Performance)

---

## 🔍 Upgraded Stock Search Engine

The stock search system has been upgraded to deliver fast, accurate, and intelligent company discovery across all 2,600+ NSE equities without relying on external APIs or small hardcoded lists.

### 1. 7-Tier Relevance Ranking Algorithm
Query matching executes sequentially through prioritized relevance tiers to ensure exact matches rank first:
1. **Tier 1 (Exact NSE Symbol Match — 1000 pts)**: Entering `TCS` returns `TCS` (Tata Consultancy Services) at Rank #1.
2. **Tier 2 (Exact Company Name Match — 900 pts)**: Entering `Tata Consultancy Services` ranks TCS at #1.
3. **Tier 3 (Exact Alias Match — 850 pts)**: Common corporate aliases resolve immediately:
   - `HDFC` -> `HDFCBANK`
   - `SBI` -> `SBIN`
   - `L&T` -> `LT`
   - `Tata Motors` -> `TATAMOTORS`
4. **Tier 4 (Symbol Prefix Match — 800+ pts)**: Typing `ELECO` matches `ELECON` immediately, rather than showing unrelated companies containing similar letters.
5. **Tier 5 (Company Name Prefix Match — 750 pts)**: Typing `Tata Consult` returns Tata Consultancy Services.
6. **Tier 6 (Alias Prefix & Substring Match — 700 / 400 pts)**: Partial alias and internal name matching.
7. **Tier 7 (Sector & Industry Match — 150 / 140 pts)**: Queries like `Banking`, `Information Technology`, or `Capital Goods` list all constituents within that sector, tagged with a `Sector Match` badge.

### 2. Zero Fallback & Accurate Symbol Resolution
- **No Silent Substitutions**: A failed or unlisted search never falls back to Reliance Industries or any default stock.
- **Clear Empty State**: Displays an informative "No matching stocks found" notification with search tips.
- **Guaranteed Symbol Integrity**: Selecting a search result opens the stock details page for that exact symbol.

### 3. Autocomplete Search UI/UX
- **Debounced API Requests (220ms)** with `AbortController` cancellation to prevent race conditions and stale responses.
- **Full Keyboard Navigation**: `ArrowDown`, `ArrowUp`, `Enter` to select, and `Escape` to close.
- **Clearable Recent Searches**: Saved locally in browser storage with individual removal and "Clear All" action.
- **Popular Stocks Filter**: Shown only when the input field is empty; never mixed into active query results.
- **Dynamic Monogram Avatars**: Consistent color-hashed initial badges, showing verified company logos when available.

---

## 🧠 Explainable ML Stock Rating Engine

The rating system uses a data-driven, calibrated ensemble classifier and multi-factor analytical scoring across 5 tiers:
`STRONG_BUY`, `BUY`, `HOLD`, `SELL`, and `STRONG_SELL`.

### 1. Multi-Factor Parameter Groups
- **Valuation**: P/E ratio, Sector-relative P/E, P/B ratio, Dividend Yield, and derived Book Value.
- **Profitability & Efficiency**: Return on Equity (ROE), Return on Capital Employed (ROCE), Operating Profit Margin (OPM).
- **Financial Strength & Debt**: Debt-to-Equity (D/E), Interest Coverage ratio, and Current ratio.
  - *Sector-Aware Bank Handling*: Banking and Financial Services (e.g. HDFCBANK, SBIN, ICICIBANK) are evaluated using capital adequacy and banking solvency standards rather than penalizing commercial deposit leverage.
- **Market Trend & Momentum**: 1-month, 3-month, and 1-year total returns, RSI (14), and benchmark relative strength.
- **Risk & Volatility**: 20-day annualized volatility, Beta relative to Nifty 50, and downside volatility risk.
- **Earnings Quality & Sentiment**: Operational cash flow alignment and financial news headline sentiment.

### 2. Statistically Calibrated Class Probabilities
- Uses `CalibratedClassifierCV` (sigmoid/isotonic) so that confidence percentages represent true statistical class probabilities rather than arbitrary static numbers.
- Displays full category probability distribution: `STRONG_BUY`, `BUY`, `HOLD`, `SELL`, `STRONG_SELL`.

### 3. Five Core Analytical Pillars (0 to 100)
1. **Valuation**: Evaluated against sector median benchmarks.
2. **Profitability**: Evaluated against capital productivity thresholds.
3. **Financial Health**: Evaluated based on balance sheet solvency and industry-specific capital structures.
4. **Momentum**: Evaluated on price trends and RSI momentum.
5. **Risk Profile**: Evaluated on Beta and annualized volatility.

### 4. Explainability & Missing-Data Guard
- **Explainable Factors**: Generates specific positive drivers (e.g. *"High capital efficiency with 33.5% ROE"*), negative factors (e.g. *"P/E valuation of 28.5x trades at premium"*), and risk indicators.
- **Insufficient Data Guard**: If fewer than 2 verifiable metrics are available for a company, the engine returns `INSUFFICIENT_DATA` with a 0 score and explicit rationale rather than fabricating a misleading rating.
- **Missing Value Imputation**: Imputes unpopulated non-critical metrics using authentic sector median benchmarks (`SECTOR_BENCHMARKS`).
- **Telemetry & Freshness**: Outputs data completeness percentage, ISO evaluation timestamp, and model version (`EquityIQ-v2.1-CalibratedEnsemble`).
- **Regulatory Disclaimer**: Prominently notes that ML ratings are mathematical research tools, not SEBI-registered financial advisory services.

---

## 🚀 Microservice Architecture

1. **React Frontend Workspace (`frontend/`)**: React + Vite + Tailwind CSS dashboard featuring live price series charts, financial metrics grid, 769+ stock autocomplete search, ML rating widget with 5 pillars and calibrated confidence, dedicated RAG workspace, and PDF/CSV uploaders.
2. **Node.js Express API Gateway (`backend/`)**: Express API server managing stock master data (`Stock`), daily market data (`StockMarketData`), search ranking engine, news ingestion, and proxying to the Python AI service.
3. **Python FastAPI AI Engine (`ai-service/`)**: FastAPI microservice hosting:
   - ML Calibrated Ensemble Stock Rating Engine (`app/services/rating_service.py`)
   - ML News Sentiment Classifier (TF-IDF + Scikit-Learn)
   - ML Quantitative Risk & Volatility Model (GradientBoostingRegressor)
   - RAG Vector Store & Cosine Similarity Context Retriever (ChromaDB)
   - Document NLP Extractor (PDF & CSV parser via `pypdf` and `pandas`)
4. **Database Container (`mongo`)**: MongoDB 7.0 container persisting stock master universe, historical daily prices, user accounts, and uploaded filings.

---

## ⚡ Quickstart with Docker Compose

Launch all microservices in production mode:

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

### Access Microservices:
- **Frontend Research Workspace**: `http://localhost:80` (or `http://localhost:3000` in dev)
- **Backend Express API**: `http://localhost:5000/api/health`
- **FastAPI AI Engine**: `http://localhost:8000/health`
- **MongoDB Database**: `mongodb://localhost:27017`

---

## 🧪 Comprehensive Verification & Testing

### 1. Backend Search & Rating Tests (18/18 Integration Tests)
```bash
cd backend
npm test -- --testPathPattern=stocks
```
Verifies:
- Exact symbol (`TCS`), exact name (`Tata Consultancy Services`), and partial name (`Tata Consult`)
- Alias resolution (`HDFC` -> `HDFCBANK`, `SBI` -> `SBIN`, `L&T` -> `LT`)
- Sector search (`Banking`) and prefix prioritization (`ELECO` -> `ELECON`)
- Zero fallback to Reliance on non-matching queries
- Complete explainable ML rating and 404 on unlisted symbols

### 2. Python AI Service Tests
```bash
cd ai-service
pytest app/tests/test_rating.py
```
Verifies:
- Standard multi-factor prediction with pillars and feature importances
- Bank sector leverage handling (D/E not penalized like industrial)
- Insufficient data guard returning `INSUFFICIENT_DATA` with 0 score
- Input parameter validation (400 on empty symbol)

### 3. Frontend Production Build
```bash
cd frontend
npm run build
```
Compiles Vite production assets cleanly with 0 syntax or bundle errors.

---

## 🚀 Deploying on Vercel (Full-Stack Setup)

EquityIQ is pre-configured for **1-click full-stack deployment on Vercel**:

### 1. Project Structure for Vercel
- **Frontend**: Built via Vite into `frontend/dist`.
- **API Backend**: Handled by Vercel Serverless Functions via `api/index.js` forwarding to `backend/src/app.js`.
- **Configuration**: Managed automatically via `vercel.json`.

### 2. Deployment Steps
1. Push your repository to GitHub.
2. In the [Vercel Dashboard](https://vercel.com/new), select your `EQUITY-IQ` repository.
3. Keep default settings:
   - **Framework Preset**: Vite / Other
   - **Build Command**: `npm --prefix frontend install && npm --prefix frontend run build`
   - **Output Directory**: `frontend/dist`
4. Add the following **Environment Variables** in Vercel project settings:
   - `MONGO_URI`: Your MongoDB Atlas connection string (optional; in-memory universe operates if omitted)
   - `JWT_SECRET`: Secret key for authentication tokens
   - `NODE_ENV`: `production`
5. Click **Deploy**. Vercel will build both the frontend and the serverless API routes under `/api/*`.

---

## ⏱️ 10-Second Real-Time Live Auto-Polling

EquityIQ features a real-time market data synchronization engine:
- **Client Auto-Sync**: The stock details view polls `/api/stocks/:symbol/quote` every 10 seconds silently in the background.
- **Live Visual Feedback**: Includes an animated pulsing radar dot (`LIVE • 10s Auto-Sync`), real-time price tick transitions (emerald for upticks, rose for downticks), and a force-refresh trigger.
- **Market Indices Strip**: Real-time polling every 10 seconds for NIFTY 50, SENSEX, NIFTY BANK, NIFTY IT, and NIFTY MIDCAP 100.
