from src.integrations.railway.railradar_client import railradar_client


def test_railradar_live_status():

    train_number = "12919"

    data = railradar_client.get_live_train_status(train_number)

    print("\n========== RAILRADAR RESPONSE ==========\n")
    print(data)

    assert data is not None