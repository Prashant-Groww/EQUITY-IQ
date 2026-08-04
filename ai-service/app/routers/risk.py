from fastapi import APIRouter, HTTPException
from app.schemas.risk import RiskRequest, RiskPredictionResponse
from app.services.risk_service import predict_risk

router = APIRouter(prefix="/predict", tags=["ML Risk & Volatility Analytics"])

@router.post("/risk", response_model=RiskPredictionResponse)
async def get_risk_prediction(request: RiskRequest):
    """
    POST /predict/risk
    Evaluates quantitative technical indicators (Volatility, VaR, Max Drawdown, Beta, Sharpe, RSI, MACD)
    and predicts Risk Score & Volatility Tier using ML models.
    """
    try:
        if not request.symbol or not request.symbol.strip():
            raise HTTPException(status_code=400, detail="Stock symbol parameter is required.")
        return predict_risk(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Risk prediction failed: {str(e)}")
