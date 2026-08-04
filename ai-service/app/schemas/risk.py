from pydantic import BaseModel, Field
from typing import List, Optional

class HistoricalPricePoint(BaseModel):
    date: str
    close: float
    volume: Optional[float] = 0.0

class RiskRequest(BaseModel):
    symbol: str = Field(..., example="RELIANCE")
    prices: List[HistoricalPricePoint]

class RiskMetrics(BaseModel):
    volatility_20d: float = Field(..., description="Annualized 20-Day Volatility")
    volatility_60d: float = Field(..., description="Annualized 60-Day Volatility")
    var_95: float = Field(..., description="1-Day 95% Value at Risk")
    var_99: float = Field(..., description="1-Day 99% Value at Risk")
    max_drawdown: float = Field(..., description="Peak-to-Trough Maximum Drawdown")
    beta: float = Field(..., description="Beta relative to Nifty 50 Benchmark")
    sharpe_ratio: float = Field(..., description="Annualized Sharpe Ratio (Rf = 6.5%)")
    rsi: float = Field(..., description="14-Period Relative Strength Index")
    macd_histogram: float = Field(..., description="MACD Histogram (12, 26, 9)")

class RiskPredictionResponse(BaseModel):
    symbol: str
    risk_score: float = Field(..., description="Predicted Risk Score (0-100 scale)")
    risk_tier: str = Field(..., description="Risk Classification: Low Risk | Moderate Risk | High Risk")
    confidence: float = Field(..., description="Model Confidence")
    metrics: RiskMetrics
