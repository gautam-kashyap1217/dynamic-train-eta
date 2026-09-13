
from src.modules.eta.eta_schemas import ETAResponse
from src.modules.eta.eta_prediction_logger import save_prediction


# Temporary sample response for testing the CSV logger
sample_response = ETAResponse(
    train_id="TRN10001",
    train_number="12919",
    current_station="VRBD",
    next_station="KSV",
    current_delay=15.0,
    speed_kmph=50.0,
    eta_minutes=30.0,
    p10=20.0,
    p50=30.0,
    p90=45.0,
    scheduled_arrival="2026-09-13T20:30:00+05:30",
    predicted_arrival="2026-09-13T20:35:00+05:30",
    arrival_range_start="2026-09-13T20:25:00+05:30",
    arrival_range_end="2026-09-13T20:50:00+05:30",
    scheduled_departure=None,
    predicted_departure=None,
    departure_range_start=None,
    departure_range_end=None,
)


# Save the sample prediction
record = save_prediction(sample_response)

print("Prediction saved successfully!")
print("Prediction ID:", record["prediction_id"])
print("Validation status:", record["validation_status"])
print("CSV file created at:")
print("data/eta_prediction_history.csv")