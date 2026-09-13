from src.modules.train.train_repository import train_repository
from src.modules.train.train_mapping import TRAIN_MAPPING


class TrainService:

    def search_trains(self, query: str = ""):

        df = train_repository.get_all_trains()

        if df is None or df.empty:
            return []

        if query:
            filtered = df[
                df["train_id"].astype(str).str.contains(
                    query,
                    case=False,
                    na=False
                )
            ]

            return filtered.to_dict(orient="records")

        return df.head(50).to_dict(orient="records")

    def get_train_mapping(self, train_id: str):

        train_id = str(train_id).strip()

        # Check whether the provided value is an internal train ID.
        mapping = TRAIN_MAPPING.get(train_id)

        if mapping:
            return {
                **mapping,
                "train_id": train_id,
            }

        # If not found, check whether it is a train number.
        for internal_id, train_info in TRAIN_MAPPING.items():

            if str(train_info.get("train_number")).strip() == train_id:
                return {
                    **train_info,
                    "train_id": internal_id,
                }

        return None

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