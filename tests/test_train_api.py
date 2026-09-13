from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)


def test_get_all_trains():
    response = client.get("/api/v1/trains/")

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "success"
    assert "trains" in data


def test_get_real_trains():
    response = client.get("/api/v1/trains/real")

    assert response.status_code in [200, 502]

    if response.status_code == 200:
        data = response.json()
        assert data["status"] == "success"
        assert "trains" in data