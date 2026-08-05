from fastapi import APIRouter, HTTPException, status
from app.schemas.portfolio import PortfolioOptimizeRequest, PortfolioOptimizeResponse
from app.services.portfolio_analytics_service import portfolio_analytics_service

router = APIRouter(prefix="/predict", tags=["Portfolio Optimization"])

@router.post("/portfolio-optimize", response_model=PortfolioOptimizeResponse, status_code=status.HTTP_200_OK)
async def optimize_portfolio_endpoint(request: PortfolioOptimizeRequest):
    """
    POST /predict/portfolio-optimize
    Computes portfolio diversification score, risk beta, concentration alerts, and AI rebalancing recommendations.
    """
    try:
        if not request.holdings:
            raise HTTPException(status_code=400, detail="Holdings array cannot be empty.")
        return portfolio_analytics_service.optimize_portfolio(request)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Portfolio optimization failed: {str(e)}")
