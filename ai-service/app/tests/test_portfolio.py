from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_portfolio_optimization():
    payload = {
        "holdings": [
            {
                "symbol": "RELIANCE",
                "quantity": 100,
                "avg_buy_price": 1200.0,
                "current_price": 1290.0
            },
            {
                "symbol": "TCS",
                "quantity": 20,
                "avg_buy_price": 3500.0,
                "current_price": 3400.0
            },
            {
                "symbol": "INFY",
                "quantity": 50,
                "avg_buy_price": 1500.0,
                "current_price": 1600.0
            }
        ]
    }
    response = client.post("/predict/portfolio-optimize", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "diversification_score" in data
    assert 0 <= data["diversification_score"] <= 100
    assert "portfolio_beta" in data
    assert "concentration_risk" in data
    assert "recommendations" in data
    assert len(data["recommendations"]) == 3
    assert "asset_allocation" in data
    assert "RELIANCE" in data["asset_allocation"]
    assert "summary" in data
    assert len(data["summary"]) > 0

def test_empty_portfolio_validation():
    payload = {"holdings": []}
    response = client.post("/predict/portfolio-optimize", json=payload)
    assert response.status_code == 422  # Pydantic min_items validation error
