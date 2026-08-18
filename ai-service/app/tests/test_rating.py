import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_rating_prediction():
    payload = {
        "symbol": "RELIANCE",
        "price": 1296.30,
        "pe_ratio": 24.8,
        "pb_ratio": 2.1,
        "roe": 18.5,
        "roce": 22.4,
        "debt_to_equity": 0.38,
        "sentiment_score": 0.75,
        "volatility_20d": 0.22,
        "beta": 1.05,
        "rsi": 54.5
    }
    response = client.post("/predict/rating", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["symbol"] == "RELIANCE"
    assert data["recommendation"] in ["STRONG_BUY", "BUY", "HOLD", "SELL", "STRONG_SELL"]
    assert "confidence_pct" in data
    assert "overall_score" in data
    assert len(data["factors"]) == 5

def test_missing_symbol_rating():
    payload = {"symbol": ""}
    response = client.post("/predict/rating", json=payload)
    assert response.status_code == 400
