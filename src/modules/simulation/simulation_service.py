import asyncio

from src.modules.simulation.simulation_schemas import SimulationState
from src.integrations.graph.network_graph import railway_graph
from src.integrations.graph.spatial_extractor import spatial_extractor


class SimulationService:
    """Manages simulated live train state."""

    def __init__(self):
        self.trains = {}

    def get_train_state(self, train_number: str):
        return self.trains.get(train_number)

    def set_train_state(self, state: SimulationState):
        self.trains[state.train_number] = state
        return state

    def initialize_train(self, train_number: str):
        current_station = "NDLS"
        next_station = "AGC"

        segment = railway_graph.get_edge_data(
            current_station,
            next_station
        )

        if segment is None:
            raise ValueError(
                f"No graph segment found: "
                f"{current_station} -> {next_station}"
            )

        start_coords = spatial_extractor.get_coordinates(
            current_station
        )

        state = SimulationState(
            train_number=train_number,
            current_station=current_station,
            next_station=next_station,
            latitude=start_coords["latitude"],
            longitude=start_coords["longitude"],
            speed_kmph=float(segment["average_speed_kmph"]),
            progress_percent=0.0,

            # Initial delay.
            # Positive = late
            # Negative = early
            current_delay_min=-10.0
        )

        return self.set_train_state(state)

    def advance_train(
        self,
        train_number: str,
        elapsed_seconds: float = 3.0
    ):
        state = self.get_train_state(train_number)

        if state is None:
            raise ValueError(
                f"No simulation state found for train {train_number}"
            )

        segment = railway_graph.get_edge_data(
            state.current_station,
            state.next_station
        )

        if segment is None:
            raise ValueError(
                f"No graph segment found: "
                f"{state.current_station} -> {state.next_station}"
            )

        distance_km = float(segment["distance_km"])
        base_speed_kmph = float(segment["average_speed_kmph"])

        # ---------------------------------------------------------
        # SIMULATED SPEED
        # ---------------------------------------------------------
        #
        # Different speed phases make the simulation dynamic.
        #
        # Faster than normal -> train recovers delay
        # Slower than normal -> train gains delay
        #

        progress = state.progress_percent

        if progress < 25:
            speed_factor = 1.15
        elif progress < 50:
            speed_factor = 1.10
        elif progress < 75:
            speed_factor = 0.90
        else:
            speed_factor = 1.20

        simulated_speed = base_speed_kmph * speed_factor

        # ---------------------------------------------------------
        # POSITION UPDATE
        # ---------------------------------------------------------

        distance_travelled_km = (
            simulated_speed * elapsed_seconds / 3600
        )

        progress_increase = (
            distance_travelled_km / distance_km
        ) * 100

        new_progress = min(
            progress + progress_increase,
            100.0
        )

        # ---------------------------------------------------------
        # DELAY UPDATE
        # ---------------------------------------------------------
        #
        # Prototype-friendly delay behaviour:
        #
        # First part:
        #   Train is faster -> delay decreases quickly.
        #
        # Middle part:
        #   Train continues recovering delay.
        #
        # Later part:
        #   Train becomes slower -> delay can increase again.
        #
        # This allows the frontend to demonstrate:
        #
        #   +10 min  -> Late
        #   +5 min   -> Late
        #    0 min   -> On Time
        #   -5 min   -> Early
        #   -10 min  -> Early
        #

        if progress < 25:
            delay_change_per_minute = -0.60
        elif progress < 50:
            delay_change_per_minute = -0.35
        elif progress < 75:
            delay_change_per_minute = 0.45
        else:
            delay_change_per_minute = -0.20

        delay_change = (
            delay_change_per_minute
            * (elapsed_seconds / 3.0)
        )

        new_delay = state.current_delay_min + delay_change

        # Keep the prototype delay within a sensible range.
        new_delay = max(
            min(new_delay, 30.0),
            -15.0
        )

        # ---------------------------------------------------------
        # COORDINATE UPDATE
        # ---------------------------------------------------------

        start_coords = spatial_extractor.get_coordinates(
            state.current_station
        )

        end_coords = spatial_extractor.get_coordinates(
            state.next_station
        )

        progress_ratio = new_progress / 100.0

        new_latitude = (
            start_coords["latitude"]
            + (
                end_coords["latitude"]
                - start_coords["latitude"]
            ) * progress_ratio
        )

        new_longitude = (
            start_coords["longitude"]
            + (
                end_coords["longitude"]
                - start_coords["longitude"]
            ) * progress_ratio
        )

        # ---------------------------------------------------------
        # UPDATED STATE
        # ---------------------------------------------------------

        updated_state = state.model_copy(
            update={
                "latitude": round(new_latitude, 6),
                "longitude": round(new_longitude, 6),
                "speed_kmph": round(simulated_speed, 2),
                "progress_percent": round(new_progress, 2),
                "current_delay_min": round(new_delay, 2)
            }
        )

        return self.set_train_state(updated_state)

    async def run_simulation(
        self,
        train_number: str,
        interval_seconds: float = 3.0
    ):
        """Continuously advance a simulated train."""

        while train_number in self.trains:

            self.advance_train(
                train_number,
                elapsed_seconds=interval_seconds
            )

            await asyncio.sleep(interval_seconds)


simulation_service = SimulationService()