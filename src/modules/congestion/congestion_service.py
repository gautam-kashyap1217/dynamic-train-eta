from src.modules.congestion.congestion_repository import (
    congestion_repository
)


class CongestionService:

    def get_congestion_data(self, limit: int = 50, offset: int = 0):
        return congestion_repository.get_congestion_data(
            limit=limit,
            offset=offset
        )

    def get_latest_congestion(self):
        return congestion_repository.get_latest_congestion()


congestion_service = CongestionService()