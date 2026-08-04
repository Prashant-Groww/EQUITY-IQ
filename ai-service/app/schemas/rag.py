from pydantic import BaseModel, Field
from typing import List, Optional

class KnowledgeChunk(BaseModel):
    id: str
    source_type: str = Field(..., example="Annual Report Filing")
    source_title: str
    content: str
    url: Optional[str] = None
    timestamp: Optional[str] = None

class RAGQueryRequest(BaseModel):
    symbol: str = Field(..., example="RELIANCE")
    query: str = Field(..., example="What were the Q4 profit figures and retail revenue growth?")
    knowledge_base: Optional[List[KnowledgeChunk]] = None

class RetrievedContextChunk(BaseModel):
    chunk_id: str
    source_type: str
    source_title: str
    content: str
    relevance_score: float = Field(..., description="Cosine similarity score (0.0 to 1.0)")

class RAGQueryResponse(BaseModel):
    symbol: str
    query: str
    synthesized_answer: str
    retrieved_chunks: List[RetrievedContextChunk]
    total_chunks_searched: int
    confidence_score: float = 0.94
