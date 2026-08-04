from fastapi import APIRouter, HTTPException
from app.schemas.rag import RAGQueryRequest, RAGQueryResponse
from app.services.rag_service import query_rag_engine

router = APIRouter(prefix="/predict", tags=["RAG & Knowledge Indexing"])

@router.post("/rag-query", response_model=RAGQueryResponse)
async def rag_query_endpoint(request: RAGQueryRequest):
    """
    POST /predict/rag-query
    Performs semantic vector search over equity research context (News, Filings, Stock Fundamentals)
    and returns ranked context chunks with synthesized answers.
    """
    try:
        if not request.symbol or not request.symbol.strip():
            raise HTTPException(status_code=400, detail="Stock symbol parameter is required.")
        if not request.query or not request.query.strip():
            raise HTTPException(status_code=400, detail="Search query text is required.")
        return query_rag_engine(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RAG query processing failed: {str(e)}")
