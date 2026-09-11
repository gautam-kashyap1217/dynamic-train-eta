from src.core.database import db
from src.integrations.railway.railradar_client import railradar_client
from src.modules.train.train_mapping import TRAIN_MAPPING


class TrainRepository:

    def get_all_trains(self):
        return db.get_train_details()

    def get_schedule_data(self):
        return db.get_schedule()

    def get_live_train_status(self, train_id: str):

        mapping = TRAIN_MAPPING.get(train_id)

        if not mapping:
            return None

        real_train_number = mapping["train_number"]

        return railradar_client.get_live_train_status(
            real_train_number,
            authoritative=True
        )


train_repository = TrainRepository()