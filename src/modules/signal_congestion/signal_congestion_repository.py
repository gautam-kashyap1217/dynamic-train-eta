import pandas as pd

from src.config.paths import ML_TRAINING_FEATURES_PATH
from src.integrations.railway.railradar_client import railradar_client


class SignalCongestionRepository:
    def __init__(self):
        self._features_df = None

    def _load_features(self):
        if self._features_df is None:
            if not ML_TRAINING_FEATURES_PATH.exists():
                return None

            self._features_df = pd.read_csv(ML_TRAINING_FEATURES_PATH)

        return self._features_df

    def get_all_records(self):
        df = self._load_features()

        if df is None or df.empty:
            return []

        return df.to_dict(orient="records")

    def get_record_by_index(self, index: int):
        df = self._load_features()

        if df is None or df.empty:
            return None

        if index < 0 or index >= len(df):
            return None

        return df.iloc[index].to_dict()

    def get_latest_record(self):
        df = self._load_features()

        if df is None or df.empty:
            return None

        return df.iloc[-1].to_dict()

    def get_live_train_data(self, train_number: str):
        """
        Fetch live train data from RailRadar.
        Returns None if API fails or data is unavailable.
        """
        try:
            data = railradar_client.get_live_train_status(
                train_number,
                authoritative=True
            )

            return data

        except Exception as e:
            print(f"RailRadar unavailable: {e}")
            return None


signal_congestion_repository = SignalCongestionRepository()