import pandas as pd

from src.config.paths import ML_TRAINING_FEATURES_PATH


class CongestionRepository:

    def __init__(self):
        self._features_df = None

    def _load_features(self):
        if self._features_df is None:
            if not ML_TRAINING_FEATURES_PATH.exists():
                return None

            self._features_df = pd.read_csv(
                ML_TRAINING_FEATURES_PATH
            )

        return self._features_df
    def get_congestion_data(self, limit: int = 50, offset: int = 0):
        df = self._load_features()

        if df is None or df.empty:
            return []

        columns = [
        "trains_ahead",
        "headway_min",
        "track_congestion",
        "section_average_speed_kmph",
        "current_speed_kmph",
        "current_delay_min"
        ]

        available_columns = [
            column for column in columns
            if column in df.columns
        ] 

        paginated_df = df.iloc[offset: offset + limit]

        return paginated_df[available_columns].to_dict(
            orient="records"
        )

    

        return df[available_columns].to_dict(
            orient="records"
        )

    def get_latest_congestion(self):
        df = self._load_features()

        if df is None or df.empty:
            return None

        columns = [
            "trains_ahead",
            "headway_min",
            "track_congestion",
            "section_average_speed_kmph",
            "current_speed_kmph",
            "current_delay_min"
        ]

        available_columns = [
            column for column in columns
            if column in df.columns
        ]

        # Prototype dataset mein last row latest available sample maana jayega
        return df[available_columns].iloc[-1].to_dict()


congestion_repository = CongestionRepository()