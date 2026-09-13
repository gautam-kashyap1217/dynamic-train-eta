
import csv
import uuid
from datetime import datetime
from pathlib import Path

from src.modules.eta.eta_schemas import ETAResponse


# Project root: dynamic-train-eta/
PROJECT_ROOT = Path(__file__).resolve().parents[3]

# Prediction-history CSV file
HISTORY_FILE = PROJECT_ROOT / "data" / "eta_prediction_history.csv"


# Columns stored in the prediction-history CSV
CSV_FIELDS = [
    "prediction_id",
    "train_id",
    "train_number",
    "current_station",
    "next_station",
    "prediction_created_at",
    "scheduled_arrival",
    "predicted_arrival",
    "p10",
    "p50",
    "p90",
    "arrival_range_start",
    "arrival_range_end",
    "scheduled_departure",
    "predicted_departure",
    "departure_range_start",
    "departure_range_end",
    "current_delay",
    "predicted_speed",
    "actual_arrival",
    "actual_departure",
    "error_minutes",
    "within_5_minutes",
    "validation_status",
]


def save_prediction(response: ETAResponse) -> dict:
    """
    Save one next-station ETA prediction to the history CSV.

    The prediction is initially marked as pending.
    Actual arrival and departure will be filled in later
    when the train's actual movement is validated.
    """

    # Make sure the data directory exists
    HISTORY_FILE.parent.mkdir(parents=True, exist_ok=True)

    # Create the CSV file with headers if it does not exist
    file_exists = HISTORY_FILE.exists()

    prediction_id = str(uuid.uuid4())

    record = {
        "prediction_id": prediction_id,
        "train_id": response.train_id,
        "train_number": response.train_number,
        "current_station": response.current_station,
        "next_station": response.next_station,
        "prediction_created_at": datetime.now().astimezone().isoformat(),
        "scheduled_arrival": response.scheduled_arrival or "",
        "predicted_arrival": response.predicted_arrival or "",
        "p10": response.p10,
        "p50": response.p50,
        "p90": response.p90,
        "arrival_range_start": response.arrival_range_start or "",
        "arrival_range_end": response.arrival_range_end or "",
        "scheduled_departure": response.scheduled_departure or "",
        "predicted_departure": response.predicted_departure or "",
        "departure_range_start": response.departure_range_start or "",
        "departure_range_end": response.departure_range_end or "",
        "current_delay": response.current_delay,
        "predicted_speed": response.speed_kmph,
        "actual_arrival": "",
        "actual_departure": "",
        "error_minutes": "",
        "within_5_minutes": "",
        "validation_status": "pending",
    }

    # Append the new prediction record
    with HISTORY_FILE.open(
        mode="a",
        newline="",
        encoding="utf-8",
    ) as csv_file:

        writer = csv.DictWriter(
            csv_file,
            fieldnames=CSV_FIELDS,
        )

        if not file_exists:
            writer.writeheader()

        writer.writerow(record)

    return record