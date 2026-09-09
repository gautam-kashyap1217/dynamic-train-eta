import pandas as pd
from src.config.paths import COMBINED_SCHEDULE_PATH, TRAIN_DETAILS_PATH, DELAY_HISTORY_PATH

class DatabaseConnector:
    """Mock database connector to load prototype CSV datasets efficiently into memory for the prototype."""
    
    def __init__(self):
        self._schedule_df = None
        self._train_details_df = None
        self._delay_history_df = None

    def get_schedule(self) -> pd.DataFrame:
        if self._schedule_df is None and COMBINED_SCHEDULE_PATH.exists():
            self._schedule_df = pd.read_csv(COMBINED_SCHEDULE_PATH)
        return self._schedule_df

    def get_train_details(self) -> pd.DataFrame:
        if self._train_details_df is None and TRAIN_DETAILS_PATH.exists():
            self._train_details_df = pd.read_csv(TRAIN_DETAILS_PATH)
        return self._train_details_df

    def get_delay_history(self) -> pd.DataFrame:
        if self._delay_history_df is None and DELAY_HISTORY_PATH.exists():
            self._delay_history_df = pd.read_csv(DELAY_HISTORY_PATH)
        return self._delay_history_df

db = DatabaseConnector()