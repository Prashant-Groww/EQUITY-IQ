from fastapi import APIRouter, HTTPException
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.chat_service import generate_chat_reply

router = APIRouter(prefix="/predict", tags=["AI Chat Copilot"])

@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    POST /predict/chat
    Conversational AI Research Assistant endpoint synthesizing equity context, risk scores, and RAG knowledge.
    """
    try:
        if not request.symbol or not request.symbol.strip():
            raise HTTPException(status_code=400, detail="Stock symbol parameter is required.")
        if not request.message or not request.message.strip():
            raise HTTPException(status_code=400, detail="User message content is required.")
        return generate_chat_reply(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Chat Copilot processing failed: {str(e)}")
