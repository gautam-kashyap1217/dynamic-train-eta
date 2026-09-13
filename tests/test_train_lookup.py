from src.integrations.railway.railradar_client import railradar_client


def test_get_ntes_trains():

    data = railradar_client.get_ntes_trains()

    print("\n========== RAILRADAR TRAINS ==========\n")

    print(data)

    assert data is not None