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

### Verification Commands Run
- `npm test` (backend) — PASSED (18/18 integration tests green across stocks, auth, and health suites).
- `npm run lint` (backend) — PASSED (0 errors, 0 warnings).
- `npm run lint` (frontend) — PASSED (0 errors, 0 warnings).
- `npm run build` (frontend) — PASSED (production bundle built cleanly).

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

### Verification Commands Run
- `npm test` (backend) — PASSED (22/22 integration tests green across news, stocks, auth, and health suites).
- `npm run lint` (backend) — PASSED (0 errors, 0 warnings).
- `npm run lint` (frontend) — PASSED (0 errors, 0 warnings).
- `npm run build` (frontend) — PASSED (production bundle built cleanly).

---

## [2026-08-04] — Phase 5: ML Research — Financial News Sentiment Classifier

### Files Created / Modified
- `ml/datasets/financial_phrasebank.csv`: Financial headline sentiment corpus (Financial PhraseBank open license: positive, negative, neutral).
- `ml/training/train_sentiment.py`: Training pipeline using TF-IDF feature extraction (`ngram_range=(1,2)`, `max_features=5000`), 5-fold cross-validation with seed `42`, evaluating Logistic Regression, Naive Bayes, Linear SVM, and Random Forest.
- `ml/reports/`: Evaluation reports (`model_comparison.json`) and dataset license documentation (`README.md`).
- `ai-service/models/`: Serialized model artifacts (`sentiment_model.joblib` [LinearSVM] and `tfidf_vectorizer.joblib`).
- `ai-service/app/services/sentiment_service.py`: Inference service loading serialized joblib artifacts for high-speed sentiment prediction with rule-based fallback.
- `ai-service/app/schemas/sentiment.py`: Pydantic input/output schemas for `/predict/sentiment`.
- `ai-service/app/routers/ml.py`: FastAPI ML router introducing `POST /predict/sentiment`.
- `backend/src/controllers/mlController.js` & `backend/src/routes/mlRoutes.js`: Node.js Express passthrough router mounting `POST /api/ml/sentiment`.
- `frontend/src/components/SentimentWidget.jsx`: Sentiment analyzer UI widget with sentence input, sentiment badges, confidence meter bar, and probability distributions.

### Verification Commands Run
- `python ml/training/train_sentiment.py` — PASSED (LinearSVM selected as top model with Macro F1 = 0.5917).
- `pytest` (ai-service) — PASSED (4/4 tests green in 10.81s).
- `npm test` (backend) — PASSED (24/24 tests green across 5 test suites).
- `npm run lint` (backend) — PASSED (0 errors, 0 warnings).
- `npm run lint` (frontend) — PASSED (0 errors, 0 warnings).
- `npm run build` (frontend) — PASSED (production bundle built cleanly in 12.96s).

### Known Issues
- None.

### Next-Phase Readiness
- Phase 5 checklist is 100% complete and verified.
- Ready for **Phase 6: ML Research — Stock Volatility / Risk Prediction Model**.
