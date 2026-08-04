from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_sentiment_prediction_positive():
    response = client.post(
        "/predict/sentiment",
        json={"text": "Company reports record profits and rising revenue in quarterly review."}
    )
    assert response.status_code == 200
    data = response.json()
    assert "label" in data
    assert "confidence" in data
    assert "probabilities" in data
    assert data["label"] in ["positive", "neutral", "negative"]
    assert 0.0 <= data["confidence"] <= 1.0

def test_sentiment_prediction_negative():
    response = client.post(
        "/predict/sentiment",
        json={"text": "Operating loss doubled as sales plummeted sharply due to bankruptcy."}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["label"] in ["positive", "neutral", "negative"]

def test_sentiment_validation_error():
    response = client.post("/predict/sentiment", json={"text": ""})
    assert response.status_code == 422
