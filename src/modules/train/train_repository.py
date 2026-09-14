from src.core.database import db
from src.integrations.railway.railradar_client import railradar_client
from src.modules.train.train_mapping import TRAIN_MAPPING


class TrainRepository:

    def get_all_trains(self):
        return db.get_train_details()

    def get_schedule_data(self):
        return db.get_schedule()

    def get_live_train_status(
        self,
        train_id: str
    ):
        """
        Get live train status.

        Converts synthetic IDs into real train numbers
        when a mapping exists.
        """

        train_id = str(train_id).strip()

        mapping = TRAIN_MAPPING.get(train_id)

        if mapping:
            real_train_number = mapping["train_number"]
        else:
            real_train_number = train_id

        return railradar_client.get_live_train_status(
            real_train_number,
            authoritative=True
        )

    def get_train_details(
        self,
        train_number: str
    ):
        """
        Get scheduled timetable and station details
        from RailRadar.
        """

        train_number = str(train_number).strip()

        mapping = TRAIN_MAPPING.get(train_number)

        if mapping:
            real_train_number = mapping["train_number"]
        else:
            real_train_number = train_number

        return railradar_client.get_train_details(
            real_train_number
        )

    def get_real_trains(self):
        return railradar_client.get_ntes_trains()


train_repository = TrainRepository()