from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_analyze_location_endpoint():
    payload = {
        "crop": "Tomato",
        "quantity": 20,
        "latitude": 11.0168,
        "longitude": 76.9558,
        "target_date": "2026-09-15",
        "search_radius": 100,
        "location_name": "Coimbatore, Tamil Nadu"
    }
    response = client.post("/api/analyze-location", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["crop"] == "Tomato"
    assert data["quantity"] == 20
    assert "markets" in data
    assert len(data["markets"]) > 0
    assert "best_market" in data
    assert "recommendation" in data
    assert "estimated_net_revenue" in data["best_market"]

def test_invalid_quantity():
    payload = {
        "crop": "Tomato",
        "quantity": -5,
        "latitude": 11.0168,
        "longitude": 76.9558,
        "target_date": "2026-09-15"
    }
    response = client.post("/api/analyze-location", json=payload)
    assert response.status_code == 422 or response.status_code == 400
