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

### Known Issues
- None.

### Next-Phase Readiness
- Phase 2 checklist is 100% complete and verified.
- Ready for **Phase 3: Stock Data**.
