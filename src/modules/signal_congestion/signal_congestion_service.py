from src.modules.signal_congestion.signal_congestion_repository import (
    signal_congestion_repository
)

from src.modules.signal_congestion.signal_congestion_calculator import (
    signal_congestion_calculator
)

from src.modules.signal_congestion.signal_congestion_normalizer import (
    signal_congestion_normalizer
)


class SignalCongestionService:

    def _process_record(self, raw_data: dict, source: str = "csv"):
        """
        Raw data ko process karke congestion score,
        level aur estimated signal waiting time return karta hai.
        """

        if raw_data is None:
            return None

        score = signal_congestion_calculator.calculate_score(raw_data)

        headway = float(
            raw_data.get("headway_min", 30) or 30
        )

        level = signal_congestion_calculator.get_congestion_level(
            score
        )

        estimated_wait = signal_congestion_calculator.estimate_signal_wait(
            score,
            headway
        )

        return {
            **raw_data,
            "congestion_score": score,
            "congestion_level": level,
            "estimated_signal_wait_min": estimated_wait,
            "data_source": source
        }

    def _normalize_railradar_data(self, live_data: dict):
        """
        RailRadar response ko hamare common congestion
        feature format me convert karta hai.
        """

        return signal_congestion_normalizer.normalize(
            live_data
        )

    def get_latest_congestion(self):
        """
        CSV se latest congestion record.
        """

        raw_data = signal_congestion_repository.get_latest_record()

        return self._process_record(
            raw_data,
            source="csv"
        )

    def get_congestion_by_index(self, index: int):
        """
        CSV ke specific index ka congestion record.
        """

        raw_data = signal_congestion_repository.get_record_by_index(
            index
        )

        return self._process_record(
            raw_data,
            source="csv"
        )

    def get_all_congestion(
        self,
        limit: int = 50,
        offset: int = 0
    ):
        """
        CSV congestion records ko pagination ke saath return karta hai.
        """

        raw_data = signal_congestion_repository.get_all_records()

        paginated_data = raw_data[
            offset: offset + limit
        ]

        return [
            self._process_record(
                record,
                source="csv"
            )
            for record in paginated_data
        ]

    def get_live_congestion(self, train_number: str):
        """
        Pehle RailRadar se live data fetch karega.

        Agar RailRadar data available hua:
            source = railradar

        Agar RailRadar unavailable hua:
            CSV latest record fallback ke roop me use hoga.
        """

        live_data = (
            signal_congestion_repository
            .get_live_train_data(train_number)
        )

        # RailRadar data available
        if live_data is not None:

            normalized_data = self._normalize_railradar_data(
                live_data
            )

            if normalized_data is not None:

                return self._process_record(
                    normalized_data,
                    source="railradar"
                )

        # RailRadar unavailable, use CSV fallback
        fallback_data = (
            signal_congestion_repository
            .get_latest_record()
        )

        return self._process_record(
            fallback_data,
            source="csv_fallback"
        )


signal_congestion_service = SignalCongestionService()