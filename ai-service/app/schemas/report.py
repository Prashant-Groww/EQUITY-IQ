from pydantic import BaseModel, Field
from typing import List, Optional

class ReportAnalysisRequest(BaseModel):
    symbol: str = Field(..., description="Company Stock Ticker Symbol e.g. RELIANCE")
    title: Optional[str] = "Corporate Financial Report"
    document_text: str = Field(..., description="Raw text or extracted content of annual report")

class ExtractedMetrics(BaseModel):
    revenue_growth: Optional[str] = "N/A"
    net_profit: Optional[str] = "N/A"
    operating_margin: Optional[str] = "N/A"
    debt_to_equity: Optional[str] = "N/A"

class ReportAnalysisResponse(BaseModel):
    symbol: str
    title: str
    executive_summary: str
    metrics: ExtractedMetrics
    growth_drivers: List[str]
    key_risks: List[str]
    confidence_score: float = 0.95
