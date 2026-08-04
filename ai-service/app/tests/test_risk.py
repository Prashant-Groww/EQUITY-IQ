from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_risk_prediction():
    payload = {
        "symbol": "RELIANCE",
        "prices": [
            {"date": "2024-01-01", "close": 2800.0},
            {"date": "2024-01-02", "close": 2820.0},
            {"date": "2024-01-03", "close": 2790.0},
            {"date": "2024-01-04", "close": 2850.0},
            {"date": "2024-01-05", "close": 2890.0},
            {"date": "2024-01-06", "close": 2920.0},
            {"date": "2024-01-07", "close": 2980.0}
        ]
    }
    response = client.post("/predict/risk", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["symbol"] == "RELIANCE"
    assert "risk_score" in data
    assert "risk_tier" in data
    assert data["risk_tier"] in ["Low Risk", "Moderate Risk", "High Risk"]
    assert "metrics" in data
    assert "volatility_20d" in data["metrics"]
    assert "var_95" in data["metrics"]
    assert "beta" in data["metrics"]
