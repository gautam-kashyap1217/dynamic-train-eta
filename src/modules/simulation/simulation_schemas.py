from pydantic import BaseModel


class SimulationState(BaseModel):
    train_number: str
    current_station: str
    next_station: str
    latitude: float
    longitude: float
    speed_kmph: float
    progress_percent: float
    current_delay_min: float