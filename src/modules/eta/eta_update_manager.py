from datetime import datetime

from src.modules.simulation.simulation_service import simulation_service
from src.modules.train.train_service import train_service
from src.modules.eta.eta_schemas import ETARequest
from src.modules.eta.eta_service import eta_service


class ETAUpdateManager:
    """
    Manages the latest ETA prediction for simulated trains.
    """

    def __init__(self):
        self.latest_eta = {}

    def update_eta(self, train_number: str):
        """
        Recalculate ETA using the latest simulation state.
        """

        state = simulation_service.get_train_state(train_number)

        if state is None:
            return None

        train_info = train_service.get_train_mapping(train_number)

        if train_info is None:
            print(
                f"No train mapping found for train {train_number}"
            )
            return None

        internal_train_id = train_info["train_id"]
        real_train_number = train_info["train_number"]

        request = ETARequest(
            train_id=internal_train_id,
            train_number=real_train_number
        )

        try:
            eta_result = eta_service.predict_eta(
                request=request,
                current_station=state.current_station,
                next_station=state.next_station,
                current_delay=state.current_delay_min
            )

            eta_data = eta_result.model_dump()

            eta_data["latitude"] = state.latitude
            eta_data["longitude"] = state.longitude
            eta_data["progress_percent"] = state.progress_percent
            eta_data["speed_kmph"] = state.speed_kmph
            eta_data["last_updated"] = datetime.now().astimezone().isoformat()
            eta_data["data_source"] = "simulation"
            eta_data["is_simulated"] = True

            self.latest_eta[train_number] = eta_data

            return eta_data

        except Exception as error:
            print(
                f"ETA update failed for train {train_number}:",
                error
            )
            return None

    def get_latest_eta(self, train_number: str):
        return self.latest_eta.get(train_number)


eta_update_manager = ETAUpdateManager()