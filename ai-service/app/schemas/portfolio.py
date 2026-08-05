from typing import List, Dict, Optional
from pydantic import BaseModel, Field

class HoldingInput(BaseModel):
    symbol: str = Field(..., description="Stock symbol, e.g. RELIANCE, TCS, INFY")
    quantity: float = Field(..., gt=0, description="Quantity of shares held")
    avg_buy_price: float = Field(..., gt=0, description="Average purchase price in INR")
    current_price: Optional[float] = Field(None, gt=0, description="Current market price in INR")

class PortfolioOptimizeRequest(BaseModel):
    holdings: List[HoldingInput] = Field(..., min_length=1, description="List of portfolio holdings")

class RebalanceRecommendation(BaseModel):
    symbol: str
    action: str = Field(..., description="Action: HOLD, REBALANCE_REDUCE, or ACCUMULATE")
    current_weight_pct: float
    target_weight_pct: float
    reasoning: str

class PortfolioOptimizeResponse(BaseModel):
    diversification_score: float = Field(..., ge=0, le=100, description="Portfolio diversification score from 0 to 100")
    portfolio_beta: float = Field(..., description="Weighted portfolio Beta relative to Nifty 50")
    concentration_risk: bool = Field(..., description="True if any single asset exceeds 30% of portfolio value")
    recommendations: List[RebalanceRecommendation]
    asset_allocation: Dict[str, float] = Field(..., description="Symbol to percentage weight mapping")
    summary: str
