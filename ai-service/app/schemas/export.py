from typing import List, Optional
from pydantic import BaseModel, Field

class ResearchBriefRequest(BaseModel):
    symbol: str = Field(..., description="Stock ticker symbol, e.g. RELIANCE, TCS, INFY")
    company_name: Optional[str] = Field(None, description="Company full name")
    price: Optional[float] = Field(None, gt=0, description="Current market price in INR")
    pe_ratio: Optional[float] = Field(None, description="Price to Earnings ratio")
    market_cap: Optional[float] = Field(None, description="Market Cap in INR")
    risk_score: Optional[float] = Field(None, ge=0, le=100, description="Quantitative Risk Score")
    risk_tier: Optional[str] = Field(None, description="Risk Tier classification")
    sentiment_label: Optional[str] = Field(None, description="News Sentiment classification")
    rag_context: Optional[str] = Field(None, description="Extracted corporate filing context")

class ExecutiveSummarySection(BaseModel):
    title: str
    content: str

class ResearchBriefResponse(BaseModel):
    symbol: str
    company_name: str
    title: str
    generated_at: str
    executive_summary: str
    sections: List[ExecutiveSummarySection]
    recommendation: str = Field(..., description="Investment Recommendation: ACCUMULATE, HOLD, or REDUCE")
    target_horizon: str = Field(..., description="Recommended Investment Horizon, e.g. 12-24 Months")
    disclaimer: str
