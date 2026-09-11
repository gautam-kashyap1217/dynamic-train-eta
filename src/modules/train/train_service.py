from src.modules.train.train_repository import train_repository
from src.modules.train.train_mapping import TRAIN_MAPPING


class TrainService:

    def search_trains(self, query: str = ""):

        df = train_repository.get_all_trains()

        if df is None or df.empty:
            return []

        if query:
            filtered = df[
                df["train_id"].str.contains(
                    query,
                    case=False,
                    na=False
                )
            ]

            return filtered.to_dict(orient="records")

        return df.head(50).to_dict(orient="records")

    def get_train_mapping(self, train_id: str):

        return TRAIN_MAPPING.get(train_id)

    def get_train_schedule(self, train_id: str):

        df = train_repository.get_schedule_data()

        if df is None or df.empty:
            return []

        filtered = df[
            df["train_id"].astype(str).str.strip()
            == str(train_id).strip()
        ]

        if filtered.empty:
            return []

        return filtered.sort_values(
            "timestamp"
        ).to_dict(orient="records")


train_service = TrainService()