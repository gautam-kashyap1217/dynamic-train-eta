from src.core.database import db

class TrainRepository:
    def get_all_trains(self):
        return db.get_train_details()

    def get_schedule_data(self):
        return db.get_schedule()

train_repository = TrainRepository()