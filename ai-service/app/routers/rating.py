from fastapi import APIRouter, HTTPException, status
from app.schemas.rating import RatingRequest, RatingResponse
from app.services.rating_service import rating_engine

router = APIRouter(prefix="/predict", tags=["ML Stock Rating"])

@router.post("/rating", response_model=RatingResponse, status_code=status.HTTP_200_OK)
async def predict_stock_rating(request: RatingRequest):
    """
    POST /predict/rating
    Evaluates multi-factor quantitative ML rating (STRONG_BUY, BUY, HOLD, SELL, STRONG_SELL)
    combining financial ratios, news sentiment, volatility risk, and solvency factors.
    """
    if not request.symbol or not request.symbol.strip():
        raise HTTPException(status_code=400, detail="Stock symbol parameter is required.")
    try:
        return rating_engine.evaluate_stock(request)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Rating evaluation failed: {str(e)}")
