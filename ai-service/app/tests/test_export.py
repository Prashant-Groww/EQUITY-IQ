from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_generate_research_brief():
    payload = {
        "symbol": "RELIANCE",
        "company_name": "Reliance Industries Limited",
        "price": 1296.30,
        "pe_ratio": 24.8,
        "market_cap": 17530000000000.0,
        "risk_score": 38.5,
        "risk_tier": "Low Risk",
        "sentiment_label": "Positive",
        "rag_context": "Strong revenue growth in retail and telecommunication digital services."
    }
    response = client.post("/predict/research-brief", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["symbol"] == "RELIANCE"
    assert "RELIANCE" in data["title"]
    assert "executive_summary" in data
    assert len(data["sections"]) == 4
    assert data["recommendation"] == "ACCUMULATE"
    assert "disclaimer" in data

def test_missing_symbol_validation():
    payload = {"symbol": ""}
    response = client.post("/predict/research-brief", json=payload)
    assert response.status_code in [400, 422]
