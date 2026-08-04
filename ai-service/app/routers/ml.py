from fastapi import APIRouter, status
from app.schemas.sentiment import SentimentRequest, SentimentResponse
from app.services.sentiment_service import predict_sentiment

router = APIRouter(prefix="/predict", tags=["Machine Learning"])

@router.post("/sentiment", response_model=SentimentResponse, status_code=status.HTTP_200_OK)
async def classify_sentiment(request: SentimentRequest):
    result = predict_sentiment(request.text)
    return result
