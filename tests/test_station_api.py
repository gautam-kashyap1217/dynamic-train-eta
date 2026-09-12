from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)


def test_get_all_stations():
    response = client.get("/api/v1/stations/")

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "success"
    assert "stations" in data


def test_get_station_by_code():
    response = client.get("/api/v1/stations/BPL")

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "success"
    assert data["station"]["station_code"] == "BPL"


def test_search_station_by_name():
    response = client.get("/api/v1/stations/search?name=Bhopal")

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "success"
    assert "stations" in data