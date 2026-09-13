from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)


def test_get_congestion():
    response = client.get("/api/v1/congestion/?limit=5")

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "success"
    assert "congestion" in data
    assert len(data["congestion"]) <= 5


def test_get_latest_congestion():
    response = client.get("/api/v1/congestion/latest")

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "success"
    assert "congestion" in data