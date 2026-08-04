from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_rag_query():
    payload = {
        "symbol": "RELIANCE",
        "query": "What are the Q4 profit figures and operating margin?"
    }
    response = client.post("/predict/rag-query", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["symbol"] == "RELIANCE"
    assert "synthesized_answer" in data
    assert "retrieved_chunks" in data
    assert len(data["retrieved_chunks"]) > 0
    assert data["retrieved_chunks"][0]["relevance_score"] > 0.0
