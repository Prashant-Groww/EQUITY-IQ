from fastapi import APIRouter, HTTPException
from app.schemas.report import ReportAnalysisRequest, ReportAnalysisResponse
from app.services.report_service import analyze_report

router = APIRouter(prefix="/predict", tags=["Report Processing & Document Extraction"])

@router.post("/summarize-report", response_model=ReportAnalysisResponse)
async def summarize_report_endpoint(request: ReportAnalysisRequest):
    """
    POST /predict/summarize-report
    Parses corporate annual report text, extracts financial metrics, and generates an executive summary.
    """
    try:
        if not request.symbol or not request.symbol.strip():
            raise HTTPException(status_code=400, detail="Company stock symbol is required.")
        if not request.document_text or not request.document_text.strip():
            raise HTTPException(status_code=400, detail="Document text content is required for processing.")
        return analyze_report(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report analysis failed: {str(e)}")
