from src.core.database import db
from src.integrations.railway.railradar_client import railradar_client
from src.modules.train.train_mapping import TRAIN_MAPPING


class TrainRepository:

    def get_all_trains(self):
        return db.get_train_details()

    def get_schedule_data(self):
        return db.get_schedule()

    def get_live_train_status(self, train_id: str):
        """
        Accept both:

        1. Local synthetic ID: TRN10001
        2. Real train number: 12919
        """

        mapping = TRAIN_MAPPING.get(train_id)

        if mapping:
            real_train_number = mapping["train_number"]
        else:
            # If no local mapping exists,
            # treat input as an actual train number
            real_train_number = train_id

        return railradar_client.get_live_train_status(
            real_train_number,
            authoritative=True
        )

    def get_real_trains(self):
        return railradar_client.get_ntes_trains()


train_repository = TrainRepository()