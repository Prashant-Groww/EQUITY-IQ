from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_chat_copilot():
    payload = {
        "symbol": "RELIANCE",
        "message": "Should I buy RELIANCE stock?",
        "stock_price": 1290.90,
        "risk_tier": "Moderate Risk"
    }
    response = client.post("/predict/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["symbol"] == "RELIANCE"
    assert "reply" in data
    assert len(data["reply"]) > 0
    assert "suggested_followups" in data
    assert len(data["suggested_followups"]) > 0
    assert data["intent_detected"] == "INVESTMENT_RECOMMENDATION"
