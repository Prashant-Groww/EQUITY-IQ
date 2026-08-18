from fastapi import APIRouter, HTTPException, status
from app.schemas.export import ResearchBriefRequest, ResearchBriefResponse
from app.services.brief_generator_service import brief_generator_service

router = APIRouter(prefix="/predict", tags=["Equity Research Export"])

@router.post("/research-brief", response_model=ResearchBriefResponse, status_code=status.HTTP_200_OK)
async def generate_research_brief_endpoint(request: ResearchBriefRequest):
    """
    POST /predict/research-brief
    Generates a formal, multi-section AI Equity Research Brief combining valuation, risk tier, sentiment, and filing context.
    """
    if not request.symbol or not request.symbol.strip():
        raise HTTPException(status_code=400, detail="Stock symbol parameter is required.")
    try:
        return brief_generator_service.generate_brief(request)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Research brief generation failed: {str(e)}")
