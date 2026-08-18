from pydantic import BaseModel, Field
from typing import List, Dict, Optional

class RatingFactor(BaseModel):
    name: str = Field(..., example="Valuation & Ratios")
    weight_pct: float = Field(..., example=25.0)
    score_contribution: float = Field(..., example=18.5)
    status: str = Field(..., example="Favorable")
    details: str = Field(..., example="P/E ratio of 18.5 is below sector average with healthy 1.84% dividend yield.")

class RatingRequest(BaseModel):
    symbol: str = Field(..., example="RELIANCE")
    price: Optional[float] = Field(default=1500.0)
    pe_ratio: Optional[float] = Field(default=22.5)
    pb_ratio: Optional[float] = Field(default=3.2)
    roe: Optional[float] = Field(default=18.5)
    roce: Optional[float] = Field(default=22.4)
    debt_to_equity: Optional[float] = Field(default=0.35)
    sentiment_score: Optional[float] = Field(default=0.75)
    volatility_20d: Optional[float] = Field(default=0.22)
    beta: Optional[float] = Field(default=1.05)
    rsi: Optional[float] = Field(default=54.5)

class RatingResponse(BaseModel):
    symbol: str
    recommendation: str = Field(..., example="STRONG_BUY")
    confidence_pct: float = Field(..., example=88.5)
    overall_score: float = Field(..., example=82.4)
    positive_factors: List[str] = Field(default_factory=list)
    negative_factors: List[str] = Field(default_factory=list)
    rationale: str
    factors: List[RatingFactor]
    feature_importances: Dict[str, float]

