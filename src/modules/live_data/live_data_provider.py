from abc import ABC, abstractmethod

from src.modules.live_data.live_data_schema import LiveTrainData


class LiveDataProvider(ABC):

    @abstractmethod
    def get_train_data(self, train_number: str) -> LiveTrainData:
        raise NotImplementedError