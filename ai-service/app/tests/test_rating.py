import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_rating_prediction_standard():
    payload = {
        "symbol": "TCS",
        "company_name": "Tata Consultancy Services Limited",
        "sector": "Information Technology",
        "price": 3500.0,
        "pe_ratio": 27.5,
        "pb_ratio": 7.8,
        "roe": 33.5,
        "roce": 42.0,
        "debt_to_equity": 0.05,
        "operating_margin": 25.5,
        "sentiment_score": 0.75,
        "volatility_20d": 0.18,
        "beta": 0.85,
        "rsi": 54.5
    }
    response = client.post("/predict/rating", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["symbol"] == "TCS"
    assert data["recommendation"] in ["STRONG_BUY", "BUY", "HOLD", "SELL", "STRONG_SELL"]
    assert "confidence_pct" in data
    assert data["confidence_pct"] > 0
    assert "overall_score" in data
    assert 0 <= data["overall_score"] <= 100
    assert len(data["factors"]) == 5
    assert "pillars" in data
    assert "valuation" in data["pillars"]
    assert "profitability" in data["pillars"]
    assert "financial_health" in data["pillars"]
    assert "momentum" in data["pillars"]
    assert "risk" in data["pillars"]
    assert len(data["positive_factors"]) > 0
    assert data["data_completeness_pct"] >= 70.0


def test_rating_banking_sector_handling():
    """Verify that banking sector D/E of 5.5x is not penalized like an industrial firm."""
    payload = {
        "symbol": "HDFCBANK",
        "company_name": "HDFC Bank Limited",
        "sector": "Banking",
        "industry": "Private Banks",
        "price": 1650.0,
        "pe_ratio": 17.5,
        "pb_ratio": 2.3,
        "roe": 16.5,
        "roce": 15.0,
        "debt_to_equity": 5.5,  # Normal for a bank
        "sentiment_score": 0.65,
        "volatility_20d": 0.20,
        "beta": 1.10
    }
    response = client.post("/predict/rating", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["symbol"] == "HDFCBANK"
    assert data["pillars"]["financial_health"]["score"] >= 60.0


def test_insufficient_data_guard():
    """When fewer than 2 verifiable metrics are provided and price is null, return INSUFFICIENT_DATA."""
    payload = {
        "symbol": "UNKNOWNCO",
        "company_name": "Unknown Corp",
        "price": None,
        "pe_ratio": None,
        "pb_ratio": None,
        "roe": None,
        "debt_to_equity": None
    }
    response = client.post("/predict/rating", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["recommendation"] == "INSUFFICIENT_DATA"
    assert data["overall_score"] == 0.0
    assert data["confidence_pct"] == 0.0
    assert "Insufficient" in data["rationale"]


def test_missing_symbol_rating():
    payload = {"symbol": "   "}
    response = client.post("/predict/rating", json=payload)
    assert response.status_code == 400
