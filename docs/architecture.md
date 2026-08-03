# EquityIQ Architecture Documentation

## System Topology

```
React (Vite/Tailwind) [3000] ──HTTP──▶ Node/Express API [5000] ──HTTP──▶ Python/FastAPI AI Service [8000]
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

## Microservices Architecture & Data Flow

1. **Frontend**: SPA built with React, Vite, and Tailwind CSS. Communicates exclusively with the Node API backend via `/api/*`.
2. **Node/Express API Gateway**: Handles authentication, user management, market data proxying/caching, portfolio tracking, and proxies ML/RAG requests to FastAPI.
3. **FastAPI AI Engine**: Handles sentiment classification, financial risk assessment, document parsing (10-K/10-Q), vector store ingestion, and RAG chat generation.
4. **Data Layer**: MongoDB for transactional and persistent domain data; ChromaDB for vector embeddings.
