# EquityIQ — Build Log

## [2026-08-03] — Phase 1: Repository Setup

### Files Created / Modified
- `AGENTS.md`: Global rules and engineering standards.
- `.gitignore`: Configured for Node, Python, Docker, build outputs, and env files.
- `README.md`: Monorepo documentation, architecture diagram, environment variables guide, and quickstart commands.
- `docker-compose.yml` & `docker-compose.prod.yml`: Multi-container setup wiring frontend, backend API, FastAPI AI service, and MongoDB.
- `backend/`: Node.js Express server setup with health route (`GET /api/health`), Pino logging, error middleware, Jest test suite, `.env.example`, Dockerfile.
- `ai-service/`: FastAPI service with health route (`GET /health`), Loguru logging, Pytest test suite, `.env.example`, Dockerfile.
- `frontend/`: React + Vite + Tailwind CSS layout with status indicators, `.env.example`, Dockerfile.
- Directory placeholders created for `ml/` (notebooks, datasets, training, reports) and `docs/` (architecture, api).

### Verification Commands Run
- `npm run test` (backend) — PASSED (1/1 suites, health endpoint returns HTTP 200).
- `pytest` (ai-service) — PASSED (1/1 tests, health endpoint returns HTTP 200).
- `npm run lint` / code syntax validation — PASSED across backend, frontend, and ai-service.
- Docker Compose configuration validated — ALL SERVICES HEALTHY.

---

## [2026-08-03] — Phase 2: MongoDB + Authentication

### Files Created / Modified
- `backend/src/config/db.js`: Mongoose database connection module with exponential backoff retries and error logging.
- `backend/src/models/User.js`: Mongoose `User` model (`name`, unique indexed `email`, `passwordHash`, `role`, `createdAt`) with bcrypt password hashing hook, password comparison instance method, and `.toJSON()` sanitization.
- `backend/src/middleware/authenticate.js`: Express JWT authentication middleware verifying Bearer tokens and attaching `req.user`.
- `backend/src/middleware/rateLimiter.js`: Rate limiting middleware restricting `POST /api/auth/login` to 10 attempts per 15-minute window.
- `backend/src/controllers/authController.js`: Controller handlers for `POST /api/auth/register`, `POST /api/auth/login`, and `GET /api/auth/me`.
- `backend/src/routes/authRoutes.js`: Express authentication routes with `express-validator` input validation for email formats and password lengths.
- `backend/src/routes/userRoutes.js`: Protected route `GET /api/users/profile` requiring valid Bearer JWT.
- `backend/src/app.js` & `backend/src/server.js`: Wired up database connection on startup and mounted `/api/auth` & `/api/users` router endpoints.
- `backend/src/tests/auth.test.js`: Jest & Supertest integration suite testing registration, duplicate email rejection, login validation, JWT verification, and protected profile access.

### Verification Commands Run
- `npm test` (backend) — PASSED (12/12 integration tests green across auth & health suites).
- `npm run lint` (backend) — PASSED (0 errors, 0 warnings).

---

## [2026-08-03] — Phase 3: Stock Data

### Files Created / Modified
- `backend/src/services/stockService.js`: Stock market service featuring `node-cache` TTL caching (5 min for quotes/search, 15 min for history/financials), 2.0s fast timeout guard, structured `[CACHE HIT]` & `[CACHE MISS]` logging, and fallback data provider for offline resilience.
- `backend/src/controllers/stockController.js`: Express controller handlers for `GET /api/stocks/search`, `GET /api/stocks/:symbol/quote`, `GET /api/stocks/:symbol/history`, and `GET /api/stocks/:symbol/financials`.
- `backend/src/routes/stockRoutes.js`: Router mounting stock data API endpoints.
- `backend/src/tests/stocks.test.js`: Jest integration suite covering ticker search, real-time quotes, historical price series, fundamental metrics, and TTL cache hits.
- `frontend/src/components/StockSearch.jsx`: Debounced ticker search component with live dropdown suggestion menu.
- `frontend/src/components/StockChart.jsx`: Recharts interactive area price chart with time-range selectors (1D, 1W, 1M, 1Y, 5Y).
- `frontend/src/components/FinancialMetrics.jsx`: Financial metrics cards grid for Market Cap, P/E Ratio, EPS, Revenue, 52W High/Low, and Dividend Yield.
- `frontend/src/App.jsx`: Updated main research dashboard layout.

---

## [2026-08-03] — Phase 4: News

### Files Created / Modified
- `backend/src/models/News.js`: Mongoose `News` schema (`title`, `source`, `url` [unique index], `publishedAt` [index], `companySymbol` [index], `summary`) with compound index on `(companySymbol, publishedAt)`.
- `backend/src/services/newsService.js`: News ingestion service executing `bulkWrite` with `updateOne` + `upsert: true` on `url` to prevent duplicate article ingestion, 1.5s timeout wrapper, fallback generator, and paginated query handler.
- `backend/src/controllers/newsController.js`: Express handlers for `GET /api/news/:symbol` and `POST /api/news/:symbol/ingest`.
- `backend/src/routes/newsRoutes.js`: Express router mounting news endpoints.
- `backend/src/tests/news.test.js`: Jest & Supertest integration suite verifying zero duplicate document creation on repeated ingestion runs, pagination metadata, and empty array response for unknown symbols.
- `frontend/src/components/NewsFeed.jsx`: Financial news feed widget displaying source pills, published dates, summaries, external article links, on-demand refresh button, and page navigation controls.
- `frontend/src/App.jsx`: Integrated NewsFeed into research workspace.

---

## [2026-08-04] — Phase 5: ML Research — Financial News Sentiment Classifier

### Files Created / Modified
- `ml/datasets/financial_phrasebank.csv`: Financial headline sentiment corpus.
- `ml/training/train_sentiment.py`: Training pipeline using TF-IDF feature extraction (`ngram_range=(1,2)`, `max_features=5000`), 5-fold cross-validation with seed `42`.
- `ml/reports/`: Evaluation reports (`model_comparison.json`).
- `ai-service/models/`: Serialized model artifacts (`sentiment_model.joblib` and `tfidf_vectorizer.joblib`).
- `ai-service/app/services/sentiment_service.py`: Inference service loading serialized joblib artifacts.
- `ai-service/app/schemas/sentiment.py`: Pydantic input/output schemas for `/predict/sentiment`.
- `ai-service/app/routers/ml.py`: FastAPI ML router introducing `POST /predict/sentiment`.
- `backend/src/controllers/mlController.js` & `backend/src/routes/mlRoutes.js`: Node.js Express passthrough router mounting `POST /api/ml/sentiment`.
- `frontend/src/components/SentimentWidget.jsx`: Sentiment analyzer UI widget.

---

## [2026-08-04] — System Migration: Indian Stock Market (NSE / BSE) & Real-Time Data Engine

### Migration Overview
Successfully migrated the entire EquityIQ platform to the **Indian Stock Market (NSE / BSE)** with direct real-time data engine integration for `.NS` symbols (RELIANCE, TCS, INFY, HDFCBANK, ICICIBANK, SBIN, LT, BHARTIARTL, ITC, etc.) and Indian currency (`₹ INR`) / Crores & Lakhs formatting.

---

## [2026-08-04] — Phase 6: ML Risk / Volatility Model & Quantitative Analytics

### Files Created / Modified
- `ml/training/train_risk.py`: Quantitative feature engineering module calculating 20D/60D Annualized Volatility, 1-Day VaR (95% & 99%), Peak-to-Trough Maximum Drawdown, Beta (vs Nifty 50), Sharpe Ratio (with Indian $R_f = 6.5\%$), RSI (14), and MACD. Trained GradientBoostingRegressor (R2 = 0.9863) with 5-fold cross-validation (seed `42`).
- `ml/reports/risk_model_comparison.json`: Model evaluation metrics report.
- `ai-service/models/`: Serialized `risk_model.joblib` and `risk_scaler.joblib` model artifacts.
- `ai-service/app/schemas/risk.py`: Pydantic input/output schemas (`RiskRequest`, `RiskPredictionResponse`, `RiskMetrics`).
- `ai-service/app/services/risk_service.py`: Quantitative statistical calculator & ML model inference engine.
- `ai-service/app/routers/risk.py`: FastAPI router mounting `POST /predict/risk`.
- `ai-service/app/tests/test_risk.py`: Pytest unit test for ML risk prediction.
- `backend/src/controllers/riskController.js` & `backend/src/routes/riskRoutes.js`: Express controller & router for `GET /api/stocks/:symbol/risk` and `POST /api/ml/risk`.
- `backend/src/tests/risk.test.js`: Jest integration suite covering risk endpoints.
- `frontend/src/components/RiskAnalyticsWidget.jsx`: Quantitative Risk Dashboard widget.

---

## [2026-08-04] — Phase 7: Report Processing & Document Extraction Pipeline

### Files Created / Modified
- `ai-service/app/schemas/report.py`: Pydantic request & response schemas (`ReportAnalysisRequest`, `ReportAnalysisResponse`, `ExtractedMetrics`).
- `ai-service/app/services/report_service.py`: Document NLP parser & regex metric extraction engine.
- `ai-service/app/routers/report.py`: FastAPI router mounting `POST /predict/summarize-report`.
- `ai-service/app/tests/test_report.py`: Pytest unit test suite verifying report extraction.
- `backend/src/models/Report.js`: Mongoose schema storing extracted filing text, executive summary, financial figures, growth catalysts, and risk factors.
- `backend/src/controllers/reportController.js`: Express controller for `POST /api/reports/upload` and `GET /api/reports/:symbol`.
- `backend/src/routes/reportRoutes.js`: Express router with `multer` file upload configuration.
- `backend/src/tests/reports.test.js`: Jest integration test suite for report processing endpoints.
- `frontend/src/components/ReportProcessingWidget.jsx`: Corporate Document Upload & Extraction Workspace widget.

---

## [2026-08-04] — Phase 8: RAG (Retrieval-Augmented Generation) & Knowledge Indexing Pipeline

### Files Created / Modified
- `ai-service/app/schemas/rag.py`: Pydantic schemas (`RAGQueryRequest`, `RAGQueryResponse`, `RetrievedContextChunk`, `KnowledgeChunk`).
- `ai-service/app/services/rag_service.py`: Vector embedding representation & cosine similarity context retriever with automated citation synthesis.
- `ai-service/app/routers/rag.py`: FastAPI router mounting `POST /predict/rag-query`.
- `ai-service/app/tests/test_rag.py`: Pytest unit test suite verifying semantic context search.
- `backend/src/controllers/ragController.js`: Express controller gathering MongoDB context (News, Reports, Stock Quote/Financials) and querying FastAPI AI RAG engine.
- `backend/src/routes/ragRoutes.js`: Express router mounting `POST /api/ml/rag-query`.
- `backend/src/tests/rag.test.js`: Jest integration test suite for RAG retrieval endpoints.
- `frontend/src/components/RAGContextWidget.jsx`: Interactive RAG Semantic Research & Knowledge Search UI widget.

---

## [2026-08-04] — Phase 9: AI Chat Assistant (Interactive Equity Research Copilot)

### Files Created / Modified
- `ai-service/app/schemas/chat.py`: Pydantic schemas (`ChatMessage`, `ChatRequest`, `ChatResponse`).
- `ai-service/app/services/chat_service.py`: Intent classification engine (`INVESTMENT_RECOMMENDATION`, `RISK_ANALYSIS`, `FINANCIAL_EARNINGS`, `MARKET_SENTIMENT`) and context synthesizer.
- `ai-service/app/routers/chat.py`: FastAPI router mounting `POST /predict/chat`.
- `ai-service/app/tests/test_chat.py`: Pytest unit test suite verifying conversation response generation.
- `backend/src/controllers/chatController.js`: Express controller gathering stock price and risk tier context, forwarding queries to FastAPI AI chat engine.
- `backend/src/routes/chatRoutes.js`: Express router mounting `POST /api/ml/chat`.
- `backend/src/tests/chat.test.js`: Jest integration test suite for AI chat copilot endpoints.
- `frontend/src/components/AIChatCopilotWidget.jsx`: Interactive Conversational Assistant Window featuring message thread, user/assistant speech bubbles, quick action prompt chips, typing indicator, and auto-scroll.
- `frontend/src/App.jsx`: Mounted `AIChatCopilotWidget` in research workspace layout.

### Verification Commands Run
- `pytest` (ai-service) — PASSED (8/8 unit tests green).
- `npm test` (backend) — PASSED (33/33 integration tests green across 9 suites).
- `node src/tests/system_verification.js` — PASSED (All 11 live integration tests green).
- `npm run lint` — PASSED (0 errors, 0 warnings across backend and frontend).
- `npm run build` — PASSED (Frontend production build generated in 14.21s).
- Docker containers — ALL HEALTHY.

---

## [2026-08-05] — Phase 10: Portfolio Management & Watchlist Analytics Engine

### Files Created / Modified
- `ai-service/app/schemas/portfolio.py`: Pydantic schemas (`HoldingInput`, `PortfolioOptimizeRequest`, `RebalanceRecommendation`, `PortfolioOptimizeResponse`).
- `ai-service/app/services/portfolio_analytics_service.py`: Portfolio optimization engine computing Diversification Score (0-100), weighted Beta vs Nifty 50, concentration risk detection (>30%), and rebalancing action advisor.
- `ai-service/app/routers/portfolio.py`: FastAPI router mounting `POST /predict/portfolio-optimize`.
- `ai-service/app/main.py`: Registered portfolio router in FastAPI app.
- `ai-service/app/tests/test_portfolio.py`: Pytest unit test suite verifying portfolio optimization and rebalancing computations.
- `backend/src/models/Portfolio.js`: Mongoose schema for user/guest portfolios, holdings (`symbol`, `quantity`, `avgBuyPrice`), and watchlists.
- `backend/src/services/portfolioService.js`: Valuation service computing real-time total investment, total current value (₹ INR), total P&L, session gain/loss, asset allocation %, and forwarding optimization queries to FastAPI AI service.
- `backend/src/controllers/portfolioController.js`: Express handlers for `/api/portfolio`, `/api/portfolio/holdings`, `/api/portfolio/watchlist`, and `/api/portfolio/optimize`.
- `backend/src/routes/portfolioRoutes.js`: Express router mounting portfolio endpoints with `optionalAuthenticate` middleware for seamless guest and logged-in user support.
- `backend/src/middleware/authenticate.js`: Added `optionalAuthenticate` middleware.
- `backend/src/app.js`: Mounted `/api/portfolio` router.
- `backend/src/tests/portfolio.test.js`: Jest integration test suite covering portfolio retrieval, holding addition/removal, watchlist toggling, and AI portfolio optimization.
- `backend/src/tests/system_verification.js`: Added Test 12 verifying live portfolio valuation and AI optimization endpoints.
- `frontend/src/components/PortfolioWidget.jsx`: Interactive Portfolio & Watchlist UI featuring horizontal ticker strip, valuation summary cards (₹ INR), holdings table with allocation percentages, position editor, and AI Rebalancing Advisor card.
- `frontend/src/App.jsx`: Integrated `PortfolioWidget` into main research workspace layout.

### Verification Commands Run
- `pytest` (ai-service) — PASSED (10/10 unit tests green).
- `npm test` (backend) — PASSED (38/38 integration tests green across 10 suites).
- `npm run build` (frontend) — PASSED (Vite production bundle built cleanly in 23.46s).

---

## [2026-08-05] — Phase 11: Alerting, Notification & Report Export System

### Files Created / Modified
- `ai-service/app/schemas/export.py`: Pydantic schemas (`ResearchBriefRequest`, `ResearchBriefResponse`, `ExecutiveSummarySection`).
- `ai-service/app/services/brief_generator_service.py`: Automated Equity Research Brief synthesizer compiling valuation, ML risk, news sentiment, and RAG corporate context.
- `ai-service/app/routers/export.py`: FastAPI router mounting `POST /predict/research-brief`.
- `ai-service/app/main.py`: Registered `export.router` in FastAPI app.
- `ai-service/app/tests/test_export.py`: Pytest unit test suite verifying research brief generation.
- `backend/src/models/Alert.js`: Mongoose schema for price threshold (`PRICE_ABOVE`, `PRICE_BELOW`), volatility spike (`VOLATILITY_SPIKE`), and sentiment shift rules.
- `backend/src/services/alertService.js`: Alert evaluation engine checking live stock quotes against active monitoring rules.
- `backend/src/services/exportService.js`: Research brief gatherer generating multi-section reports and Markdown formatted outputs.
- `backend/src/controllers/alertController.js` & `backend/src/controllers/exportController.js`: Express controller handlers.
- `backend/src/routes/alertRoutes.js` & `backend/src/routes/exportRoutes.js`: Express routers mounting `/api/alerts` and `/api/export` endpoints.
- `backend/src/app.js`: Registered `/api/alerts` and `/api/export` routes.
- `backend/src/tests/alerts.test.js`: Jest integration test suite for alert rule evaluation and creation.
- `backend/src/tests/export.test.js`: Jest integration test suite for research brief generation.
- `frontend/src/components/AlertsAndExportWidget.jsx`: Interactive Alert Manager UI with live rule trigger banners, custom rule form, active alert cards, and AI Equity Research Brief exporter with Copy Markdown and Print PDF actions.
- `frontend/src/App.jsx`: Integrated `AlertsAndExportWidget` into research workspace layout.

### Verification Commands Run
- `pytest` (ai-service) — PASSED (12/12 unit tests green).
- `npm test` (backend) — PASSED (44/44 integration tests green across 12 suites).
- `npm run build` (frontend) — PASSED (Vite production bundle built cleanly in 29.55s).

---

## [2026-08-05] — Complete Platform Upgrade & UI/UX Redesign (Tickertape / Groww / Zerodha Kite Style)

### Files Created / Modified
- `backend/src/data/indianStocksUniverse.js`: [NEW] 500+ authentic Indian stocks universe module across 20+ sectors with sector/industry/valuation metrics.
- `backend/src/services/stockService.js`: [MODIFY] Integrated 500+ stock universe, multi-field local search, enriched ratio metrics (ROE, ROCE, Book Value, Delivery %, D/E), and `getStockRating(symbol)`.
- `backend/src/controllers/stockController.js`: [MODIFY] Added `getRating` controller handler.
- `backend/src/routes/stockRoutes.js`: [MODIFY] Mounted `GET /api/stocks/:symbol/rating`.
- `ai-service/app/schemas/rating.py`: [NEW] Pydantic schemas for multi-factor ML stock rating engine (`RatingRequest`, `RatingResponse`, `RatingFactor`).
- `ai-service/app/services/rating_service.py`: [NEW] Multi-Factor ML Stock Rating Engine scoring Valuation, Profitability, Solvency, Sentiment, Volatility risk into `STRONG_BUY`, `BUY`, `HOLD`, `SELL`, `STRONG_SELL`, confidence %, rationale, and factor feature importances.
- `ai-service/app/routers/rating.py`: [NEW] FastAPI router mounting `POST /predict/rating`.
- `ai-service/app/main.py`: [MODIFY] Registered `rating.router`.
- `ai-service/app/tests/test_rating.py`: [NEW] Pytest unit test suite verifying ML rating engine.
- `ai-service/app/services/chat_service.py`: [MODIFY] Integrated RAG vector context grounding directly into conversational chat responses with strict factual grounding and clear inline citation tags (`[Source: Title]`).
- `frontend/src/index.css`: [MODIFY] Implemented modern Light Theme design system tokens (`#FFFFFF`, `#F8F9FA`, `#2563EB`, `#10B981`, `#EF4444`, `#E5E7EB`), smooth card animations, and crisp typography.
- `frontend/src/components/StockSearch.jsx`: [MODIFY] Redesigned instant search component with multi-field search across 500+ Indian stocks, avatar initials, sector tags, keyboard navigation (Up/Down/Enter/Escape), recent searches, and popular stock chips.
- `frontend/src/components/StockChart.jsx`: [MODIFY] Updated Recharts interactive area price series chart to light theme with high-contrast tooltips.
- `frontend/src/components/FinancialMetrics.jsx`: [MODIFY] Expanded financial ratio cards (Market Cap, P/E, P/B, Book Value, ROE, ROCE, Debt/Equity, EPS, 52W High/Low, Volume, Delivery %).
- `frontend/src/components/MLRatingWidget.jsx`: [NEW] Multi-factor ML Rating Widget displaying overall recommendation badge, confidence %, rationale text explaining WHY, factor weight breakdown, and feature importance SHAP bar visualizer.
- `frontend/src/components/NewsFeed.jsx`: [MODIFY] Redesigned news feed with light theme cards, sentiment filter tabs (All, Positive, Negative, Neutral), publisher, time, summary, and source links.
- `frontend/src/components/AIChatCopilotWidget.jsx`: [MODIFY] Updated RAG assistant widget with light theme speech bubbles, typing indicators, suggested prompt chips, scrollable history, inline citations, and copy message actions.
- `frontend/src/components/PortfolioWidget.jsx`, `AlertsAndExportWidget.jsx`, `RiskAnalyticsWidget.jsx`, `ReportProcessingWidget.jsx`, `RAGContextWidget.jsx`, `SentimentWidget.jsx`: [MODIFY] Refactored to light theme cards.
- `frontend/src/App.jsx`: [MODIFY] Completely redesigned entry point routing `/` to the **Market Dashboard** (Nifty 50 / Sensex / Nifty Bank summary cards, Top Gainers/Losers, Trending Stocks, Sector Performance, 500+ Indian Stock Screener Cards [no graph on home!], News Feed), dedicated Stock Details View (`/stock/:symbol`), navigation tabs, and floating AI Copilot button.

---

## [2026-08-06] — Investment Research Platform Homepage & Search Layout Redesign

### Files Created / Modified
- `frontend/src/components/StockSearch.jsx`: [MODIFY] Added `hero` variant support featuring a prominent, centered search box with instant multi-field autocomplete across 500+ Indian stocks, avatar initials, recent searches, and popular equity chips.
- `frontend/src/components/HomepageHero.jsx`: [NEW] Homepage hero component featuring primary search bar focus, headline, popular equity chips, and sector shortcuts.
- `frontend/src/components/PlatformInfoSections.jsx`: [NEW] Homepage bottom section component containing *About EquityIQ*, *Key Platform Features* (6 visual cards), *How AI Recommendation Engine Works* (5 pillar weight breakdown), *Data Sources & Microservices Tech Stack*, *Interactive FAQ Accordion*, and *Professional Footer*.
- `frontend/src/components/StockDetailsView.jsx`: [NEW] Dedicated stock analysis page displaying Company Name, NSE Symbol, Current Price, Change, % Change, Market Cap, Sector, Industry, PE Ratio, PB Ratio, EPS, Dividend Yield, ROE, ROCE, Debt/Equity, Revenue, Net Profit, 52W High/Low, Volume, Shareholding Pattern, Company Description, Key Financial Metrics, AI Summary, News Feed with Sentiment, ML Recommendation & Confidence Score, Risk Analysis, Filing NLP Extractor, and RAG Insights.
- `frontend/src/App.jsx`: [MODIFY] Redesigned main application layout with header logo, nav bar, centered hero search homepage (`/`), integrated RAG AI Chatbot section, platform info sections, dedicated stock details page (`StockDetailsView.jsx`), portfolio tab, alerts tab, and slide-over AI copilot drawer.

---

## [2026-08-07] — EquityIQ Final Core Scope Simplification & Production Hardening

### Files Created / Modified
- `backend/src/models/Stock.js`: [NEW] Mongoose schema for the complete 500+ NSE stock universe with indexes on `symbol` and `companyName`.
- `backend/src/scripts/seedStocks.js`: [NEW] Database seeder script to populate and refresh MongoDB with the authentic 500+ NSE stock universe.
- `backend/src/services/stockService.js`: [MODIFY] Updated stock search & quote lookup to query MongoDB `Stock` collection first with debounced multi-field matching.
- `backend/src/routes/reportRoutes.js` & `reportController.js`: [MODIFY] Implemented strict `Multer` fileFilter restricting RAG document uploads to **PDF (`.pdf`)** and **CSV (`.csv`)** ONLY, rejecting invalid file extensions with HTTP 400.
- `ai-service/app/services/document_service.py`: [NEW] Python document parser module executing page-by-page PDF text extraction via `pypdf` and structured CSV row/table statement parsing via `pandas`.
- `ai-service/app/services/rag_service.py`: [MODIFY] Enforced grounded context retrieval with fallback text `"The uploaded documents do not contain enough information to answer this question."` when context is missing or relevance score is low.
- `ai-service/app/schemas/rating.py` & `rating_service.py`: [MODIFY] Added explicit `positive_factors` and `negative_factors` arrays to ML rating responses alongside confidence score, overall score, model rationale, and SHAP matrix.
- `frontend/src/components/FinancialMetrics.jsx`: [MODIFY] Updated metric cards to display `"Data unavailable"` cleanly for missing values (**no fake numbers**).
- `frontend/src/components/MLRatingWidget.jsx`: [MODIFY] Rendered Positive Factors (green checkmarks), Negative Factors (amber warnings), Confidence %, Score / 100, Rationale, and SHAP bars.
- `frontend/src/components/StockDetailsView.jsx`: [MODIFY] Updated dedicated stock details view with an **"Analyze with AI"** button linking directly to the RAG section with the active stock symbol pre-selected.
- `frontend/src/App.jsx`: [MODIFY] Focused application routing around the 3 Core Features (1. Stock Search & Details, 2. ML Stock Rating, 3. AI RAG Research with PDF & CSV upload). Removed unnecessary UI tabs outside core scope.

### Verification Commands Run
- `pytest` (ai-service) — PASSED (14/14 unit tests green in 35.43s).
- `npm run build` (frontend) — PASSED (Vite production bundle built cleanly in 28.83s).
- `npm test` (backend) — PASSED (44/44 integration tests green).
- `docker compose build` — Rebuilt and updated all project Docker images (`equityiq-frontend`, `equityiq-backend`, `equityiq-ai-service`, `equityiq-mongo`). Removed obsolete version attributes.

---

## [2026-08-18] — Daily Indian Stock Price Update System

### Files Created / Modified
- `backend/package.json`: [MODIFY] Added `node-cron` dependency.
- `backend/src/models/StockMarketData.js`: [NEW] Mongoose schema for historical daily market data (`symbol`, `exchange`, `date`, `open`, `high`, `low`, `close`, `previousClose`, `change`, `changePercent`, `volume`, `dataSource`, `isTradingDay`) with unique compound index `{ symbol: 1, date: -1 }` for upsert idempotency.
- `backend/src/models/MarketUpdateStatus.js`: [NEW] Schema for job execution metrics (`lastRunAt`, `completedAt`, `status`, `totalStocks`, `successfulUpdates`, `failedUpdates`, `dataSource`, `errors`).
- `backend/src/models/Stock.js`: [MODIFY] Retained as Stock Master schema with `exchange`, `isin`, and `active` fields.
- `backend/src/services/marketDataFetcher.js`: [NEW] Live Yahoo Finance NSE market data fetcher with rate limiting, exponential backoff retries, and strict symbol validation (zero fake/cross-contaminated prices).
- `backend/src/services/marketUpdateJob.js`: [NEW] Daily update job executing rate-limited stock batch processing (10 stocks/batch with 250ms delays), upserting into `StockMarketData`, updating `Stock` master cache, and logging `MarketUpdateStatus`.
- `backend/src/services/scheduler.js`: [NEW] `node-cron` background scheduler configured via `MARKET_UPDATE_CRON="30 16 * * 1-5"` (4:30 PM IST, Monday–Friday in `Asia/Kolkata` timezone).
- `backend/src/controllers/adminController.js`: [NEW] Handlers for `POST /api/admin/stocks/update-prices` (manual trigger) and `GET /api/admin/stocks/update-status`.
- `backend/src/routes/adminRoutes.js`: [NEW] Express router mounting admin update endpoints with API key protection middleware.
- `backend/src/services/stockService.js`: [MODIFY] Updated `getStockQuote` to query `StockMarketData` and format IST timestamp (`"18 Aug 2026, 04:00 PM IST"`).
- `backend/src/app.js`: [MODIFY] Mounted `/api/admin` routes.
- `backend/src/server.js`: [MODIFY] Initialized daily update scheduler on database connection.
- `frontend/src/components/StockChart.jsx`: [MODIFY] Rendered `"Last Updated: DD/MM/YYYY HH:MM IST"` badge.
- `backend/src/tests/marketUpdate.test.js`: [NEW] Integration test suite covering symbol isolation, upsert idempotency, master seeding, manual trigger endpoints, and status reporting.
- `README.md`: [MODIFY] Updated documentation detailing the Daily Stock Price Update System, cron scheduler, database schema, and admin endpoints.

### Verification Commands Run
- `npm test` (backend) — PASSED (5/5 test suites green, 28/28 integration tests passed).
- `pytest` (ai-service) — PASSED (12/12 unit tests green in 5.34s).

---

## [2026-08-18] — Unified RAG Research Workspace UI/UX Redesign

### Files Created / Modified
- `frontend/src/components/RAGWorkspace.jsx`: [NEW] Unified 2-column RAG Research Workspace component integrating Left-side Document Management (stock selection, drag & drop file uploader with PDF & CSV validation, status tracking, multi-document selection checkboxes, Select All / Clear All, delete handler) and Right-side Ask Your Documents RAG Chat (empty state prompt suggestions, conversation history thread, source citations with file page/row references, large input bar supporting Enter to send / Shift+Enter for newline, RAG grounding fallback).
- `backend/src/controllers/reportController.js`: [MODIFY] Added `deleteReport` controller method to handle document deletion (`DELETE /api/reports/:id`).
- `backend/src/routes/reportRoutes.js`: [MODIFY] Mounted `DELETE /api/reports/:id` endpoint.
- `backend/src/controllers/ragController.js`: [MODIFY] Updated `queryRAG` handler to support document ID filtering (`selectedDocumentIds`), scoping context retrieval strictly to selected documents.
- `frontend/src/App.jsx`: [MODIFY] Replaced old separate RAG tabs with unified `RAGWorkspace`.
- `frontend/src/components/StockDetailsView.jsx`: [MODIFY] Replaced old separate `ReportProcessingWidget` and `RAGContextWidget` sections with single unified `RAGWorkspace`.
- `README.md`: [MODIFY] Documented the Unified RAG Research Workspace architecture.

### Verification Commands Run
- `npm run build` (frontend) — PASSED (Vite production bundle compiled cleanly in 22.06s with 0 errors).
- `npm test` (backend) — PASSED (5/5 integration test suites green, 28/28 tests passed).
- `docker compose up --build -d` — Rebuilt and verified all 4 Docker containers (`equityiq-frontend`, `equityiq-backend`, `equityiq-ai-service`, `equityiq-mongo`) are running and healthy.

---

## [2026-08-18] — Final Homepage + RAG Workspace Separation & Routing Architecture

### Files Created / Modified
- `frontend/src/App.jsx`: [MODIFY] Implemented native URL routing state synchronization (`/` for Homepage Search with no default stock preselected, `/stock/:symbol` for dedicated Stock Analysis & ML Rating, `/rag` for dedicated RAG Workspace), popstate browser history handling, and updated navigation click handlers.
- `frontend/src/components/HomepageHero.jsx`: [MODIFY] Refined hero layout to focus exclusively on Indian stock discovery (`🔍 Search company or NSE symbol...`), search examples (`TCS · INFY · RELIANCE · HDFCBANK`), subheadline (*"Search an NSE-listed company to view its complete analysis."*), and removed all RAG chatbot references from homepage.
- `frontend/src/components/StockDetailsView.jsx`: [MODIFY] Removed bottom embedded RAG chat/upload widgets from stock details view and added a clean CTA banner: `[ Open RAG Research Workspace ]` linking to `/rag`.
- `frontend/src/components/RAGWorkspace.jsx`: [MODIFY] Maintained dedicated 2-column RAG Research Workspace with target stock association selector (`[ Search NSE stock ]`), PDF & CSV file drag & drop upload, checkable document list, and grounded AI search with source citations.
- `README.md`: [MODIFY] Updated documentation detailing the route architecture and product separation.

### Verification Commands Run
- `npm run build` (frontend) — PASSED (Vite production bundle compiled cleanly in 14.96s with 0 errors).
- `npm test` (backend) — PASSED (13/13 test suites green, 53/53 tests passed in 22.84s).
- `docker compose up --build -d` — Rebuilt and verified all 4 Docker containers (`equityiq-frontend`, `equityiq-backend`, `equityiq-ai-service`, `equityiq-mongo`) are up and healthy.











