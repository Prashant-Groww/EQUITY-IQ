from pydantic import BaseModel, Field
from typing import Dict

class SentimentRequest(BaseModel):
    text: str = Field(..., description="Text headline or news snippet to analyze", min_length=1)

class SentimentResponse(BaseModel):
    label: str = Field(..., description="Predicted sentiment category: positive, negative, or neutral")
    confidence: float = Field(..., description="Confidence score between 0.0 and 1.0")
    probabilities: Dict[str, float] = Field(..., description="Class probability distribution")
