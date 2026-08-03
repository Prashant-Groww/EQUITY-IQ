# EquityIQ — Global Rules for AI Assistant

## Process (Every Phase)

1. Produce a Task List for the phase before writing code.
2. Produce an Implementation Plan (files to add/change, approach, how it fits the existing codebase).
3. Implement incrementally, smallest safe increments, running tests as you go.
4. After implementation, run the phase's VERIFY checklist yourself (terminal + browser subagent for UI). If anything fails, fix it and re-run before proceeding — never carry a red check into the next phase.
5. Write/update `BUILD_LOG.md` at repo root: append a dated entry per phase with — files created/modified, commands run, verification results, known issues, next-phase readiness.
6. Commit to git with a Conventional Commit message per logical unit of work (`feat(auth): add JWT middleware`, `test(stocks): add cache hit test`, etc.). Never one giant commit per phase.
7. Produce a short Walkthrough artifact summarizing what changed and how to verify it, before moving to the next phase.
8. Only pause and ask the human when genuinely blocked — missing third-party API key/credential, an ambiguous product decision with no reasonable default, or a failing check you cannot resolve after two fix attempts. Otherwise proceed autonomously through the full 12 phases.

## Engineering Standards (All Phases)

- Clean architecture: controllers/services/repositories separation in Node; routers/services/schemas separation in FastAPI. No business logic in route handlers.
- SOLID where it genuinely helps — don't over-engineer a solo-service CRUD endpoint.
- Every API input validated (Joi/Zod or express-validator in Node; Pydantic models in FastAPI). Never trust client input.
- Centralized error handling middleware in every service; consistent error JSON shape `{error: {code, message, details}}`.
- Structured logging (pino or winston in Node, loguru in Python) — no bare `console.log`/`print` in committed code.
- Secrets only via `.env`, never hardcoded, never committed. Every service ships a `.env.example` with placeholder values and comments.
- No duplicated logic — shared constants/helpers factored into `/shared` or per-service `utils/`.
- Consistent naming: camelCase in JS/TS, snake_case in Python, PascalCase for React components and Mongoose/Pydantic models.
- Every ML/statistical step that involves randomness sets an explicit seed for reproducibility.
- Never skip testing to save time. A phase without passing tests is not a completed phase.
