from pydantic import BaseModel, Field
from typing import List, Optional

class ChatMessage(BaseModel):
    role: str = Field(..., example="user", description="Role: 'user' or 'assistant'")
    content: str = Field(..., example="Should I buy RELIANCE stock?")

class ChatRequest(BaseModel):
    symbol: str = Field(..., example="RELIANCE")
    message: str = Field(..., example="What is the risk level and Q4 profit for RELIANCE?")
    history: Optional[List[ChatMessage]] = []
    stock_price: Optional[float] = None
    risk_score: Optional[float] = None
    risk_tier: Optional[str] = None

class ChatResponse(BaseModel):
    symbol: str
    reply: str
    suggested_followups: List[str]
    intent_detected: str
    confidence_score: float = 0.95
