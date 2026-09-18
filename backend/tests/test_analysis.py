from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_analyze_location_endpoint():
    payload = {
        "crop": "Tomato",
        "quantity": 20,
        "latitude": 11.0168,
        "longitude": 76.9558,
        "target_date": "2026-09-25",
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

def test_ernad_to_pollachi_road_distance():
    # Ernad (Ernad Taluk, Malappuram District, Kerala): 11.1271, 76.1214
    payload = {
        "crop": "Tomato",
        "quantity": 20,
        "latitude": 11.1271,
        "longitude": 76.1214,
        "target_date": "2026-09-20",
        "search_radius": 300,
        "location_name": "Ernad, Malappuram, Kerala"
    }
    response = client.post("/api/analyze-location", json=payload)
    assert response.status_code == 200
    data = response.json()
    markets = data.get("markets", [])
    pollachi = next((m for m in markets if m["id"] == "mkt_pollachi"), None)
    
    assert pollachi is not None, "Pollachi market should be returned in analysis"
    # Road distance from Ernad to Pollachi should be approx 127-130 km (not 150.9 km)
    assert 120.0 <= pollachi["distance_km"] <= 135.0, f"Expected 120-135 km road distance, got {pollachi['distance_km']} km"
    assert pollachi["distance_type"] in ["road", "estimated"]
    # Transport cost must strictly equal distance_km * 25.0
    expected_transport = round(pollachi["distance_km"] * 25.0, 2)
    assert pollachi["transport_cost"] == expected_transport

