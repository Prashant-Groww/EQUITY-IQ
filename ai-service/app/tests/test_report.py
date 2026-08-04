from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_report_summarization():
    payload = {
        "symbol": "RELIANCE",
        "title": "Reliance Industries Annual Filing Q4",
        "document_text": "Reliance Industries net profit rose to Rs 18951 crore. Revenue grew to Rs 100000 crore. Operating margin stood at 18.2%. Debt to equity was 0.38."
    }
    response = client.post("/predict/summarize-report", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["symbol"] == "RELIANCE"
    assert "executive_summary" in data
    assert "metrics" in data
    assert "18951 crore" in data["metrics"]["net_profit"]
    assert data["metrics"]["operating_margin"] == "18.2%"
    assert "growth_drivers" in data
    assert "key_risks" in data
