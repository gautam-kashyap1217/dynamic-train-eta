import random
from datetime import datetime
from typing import Dict

from src.modules.live_data.live_data_provider import LiveDataProvider
from src.modules.live_data.live_data_schema import LiveTrainData


class SyntheticProvider(LiveDataProvider):
    """
    Generates synthetic live train data for prototype/demo purposes.
    """

    def __init__(self):
        self.train_states: Dict[str, dict] = {}

    def _initialize_train(self, train_number: str) -> dict:
        """
        Initialize a train only once.
        """

        return {
            "train_number": train_number,
            "current_station": "NDLS",
            "next_station": "AGC",

            "latitude": 28.6139,
            "longitude": 77.2090,

            "speed_kmph": 70.0,
            "delay_minutes": 5.0,

            "distance_travelled_km": 0.0,
        }

    def get_train_data(self, train_number: str) -> LiveTrainData:
        """
        Return updated synthetic data for the requested train.
        """

        if train_number not in self.train_states:
            self.train_states[train_number] = self._initialize_train(
                train_number
            )

        state = self.train_states[train_number]

        # Simulate changing speed
        speed_change = random.uniform(-5, 5)
        state["speed_kmph"] = max(
            20.0,
            min(120.0, state["speed_kmph"] + speed_change)
        )

        # Simulate train movement
        movement_factor = 0.00015

        state["latitude"] += movement_factor
        state["longitude"] += movement_factor * 1.2

        # Simulate distance travelled
        state["distance_travelled_km"] += (
            state["speed_kmph"] / 3600
        ) * 10

        # Simulate small delay variations
        delay_change = random.uniform(-0.5, 0.8)
        state["delay_minutes"] = max(
            0.0,
            state["delay_minutes"] + delay_change
        )

        return LiveTrainData(
            train_number=state["train_number"],
            current_station=state["current_station"],
            next_station=state["next_station"],
            latitude=state["latitude"],
            longitude=state["longitude"],
            speed_kmph=round(state["speed_kmph"], 2),
            delay_minutes=round(state["delay_minutes"], 2),
            distance_travelled_km=round(
                state["distance_travelled_km"], 2
            ),
            timestamp=datetime.now().astimezone(),
            data_source="synthetic",
            is_simulated=True,
        )