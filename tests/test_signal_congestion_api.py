from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)


def test_get_signal_congestion():
    response = client.get(
        "/api/v1/signal-congestion/?limit=5"
    )

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "success"
    assert "congestion" in data
    assert len(data["congestion"]) <= 5


def test_get_latest_signal_congestion():
    response = client.get(
        "/api/v1/signal-congestion/latest"
    )

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "success"
    assert "congestion" in data


def test_get_section_signal_congestion():
    response = client.get(
        "/api/v1/signal-congestion/section/0"
    )

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "success"
    assert "congestion_score" in data["congestion"]


def test_get_live_signal_congestion():
    response = client.get(
        "/api/v1/signal-congestion/live/12919"
    )

    assert response.status_code in [200, 404, 502]

    if response.status_code == 200:
        data = response.json()

        assert data["status"] == "success"
        assert "congestion" in data