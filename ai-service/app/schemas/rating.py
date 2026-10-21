from pydantic import BaseModel, Field
from typing import List, Dict, Optional

class RatingFactor(BaseModel):
    name: str = Field(..., description="Factor group name (e.g. Valuation & Ratios)")
    weight_pct: float = Field(..., description="Weight percentage in overall rating")
    score_contribution: float = Field(..., description="Points contributed by this factor")
    status: str = Field(..., description="Status assessment (e.g. Favorable, Pristine)")
    details: str = Field(..., description="Human-readable explanation of factor metrics")

class RatingPillar(BaseModel):
    name: str
    score: float = Field(..., ge=0.0, le=100.0)
    status: str
    summary: str

class RatingRequest(BaseModel):
    symbol: str = Field(..., json_schema_extra={"example": "TCS"})
    company_name: Optional[str] = Field(default=None, json_schema_extra={"example": "Tata Consultancy Services Limited"})
    sector: Optional[str] = Field(default=None, json_schema_extra={"example": "Information Technology"})
    industry: Optional[str] = Field(default=None, json_schema_extra={"example": "IT Services & Consulting"})
    price: Optional[float] = Field(default=None, json_schema_extra={"example": 3500.0})
    pe_ratio: Optional[float] = Field(default=None, json_schema_extra={"example": 28.5})
    pb_ratio: Optional[float] = Field(default=None, json_schema_extra={"example": 8.2})
    dividend_yield: Optional[float] = Field(default=None, json_schema_extra={"example": 1.4})
    roe: Optional[float] = Field(default=None, json_schema_extra={"example": 32.0})
    roce: Optional[float] = Field(default=None, json_schema_extra={"example": 38.5})
    debt_to_equity: Optional[float] = Field(default=None, json_schema_extra={"example": 0.08})
    interest_coverage: Optional[float] = Field(default=None, json_schema_extra={"example": 45.0})
    current_ratio: Optional[float] = Field(default=None, json_schema_extra={"example": 2.1})
    operating_margin: Optional[float] = Field(default=None, json_schema_extra={"example": 24.5})
    revenue_growth_yoy: Optional[float] = Field(default=None, json_schema_extra={"example": 12.5})
    profit_growth_yoy: Optional[float] = Field(default=None, json_schema_extra={"example": 14.0})
    return_1m: Optional[float] = Field(default=None, json_schema_extra={"example": 2.5})
    return_3m: Optional[float] = Field(default=None, json_schema_extra={"example": 6.8})
    return_1y: Optional[float] = Field(default=None, json_schema_extra={"example": 18.5})
    volatility_20d: Optional[float] = Field(default=None, json_schema_extra={"example": 0.18})
    beta: Optional[float] = Field(default=None, json_schema_extra={"example": 0.85})
    rsi: Optional[float] = Field(default=None, json_schema_extra={"example": 56.0})
    sentiment_score: Optional[float] = Field(default=None, json_schema_extra={"example": 0.65})

class RatingResponse(BaseModel):
    symbol: str
    company_name: Optional[str] = None
    sector: Optional[str] = None
    recommendation: str = Field(..., json_schema_extra={"example": "STRONG_BUY"})
    confidence_pct: float = Field(..., description="Statistically calibrated class probability", json_schema_extra={"example": 84.5})
    overall_score: float = Field(..., description="Quantitative multi-factor score out of 100", json_schema_extra={"example": 81.2})
    data_completeness_pct: float = Field(default=100.0, description="Percentage of parameters populated from authentic data")
    data_freshness: str = Field(..., description="Timestamp of model evaluation")
    model_version: str = Field(default="EquityIQ-v2.1-CalibratedEnsemble")
    positive_factors: List[str] = Field(default_factory=list)
    negative_factors: List[str] = Field(default_factory=list)
    risk_indicators: List[str] = Field(default_factory=list)
    category_probabilities: Dict[str, float] = Field(default_factory=dict)
    rationale: str
    factors: List[RatingFactor]
    pillars: Dict[str, RatingPillar] = Field(default_factory=dict)
    feature_importances: Dict[str, float] = Field(default_factory=dict)
