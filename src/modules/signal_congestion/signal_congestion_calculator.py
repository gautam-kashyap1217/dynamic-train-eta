class SignalCongestionCalculator:
    """
    Calculates estimated signal congestion based on
    train density, headway, track congestion, speed
    reduction, and delay.
    """

    def calculate_score(self, data: dict) -> float:
        trains_ahead = float(
            data.get("trains_ahead", 0) or 0
        )

        headway = float(
            data.get("headway_min", 30) or 30
        )

        track_congestion = float(
            data.get("track_congestion", 0) or 0
        )

        current_speed = float(
            data.get("current_speed_kmph", 0) or 0
        )

        section_average_speed = float(
            data.get("section_average_speed_kmph", 0) or 0
        )

        current_delay = float(
            data.get("current_delay_min", 0) or 0
        )

        score = 0.0

        # 1. Trains ahead
        if trains_ahead >= 6:
            score += 30
        elif trains_ahead >= 4:
            score += 22
        elif trains_ahead >= 2:
            score += 12
        elif trains_ahead >= 1:
            score += 5

        # 2. Headway
        if headway <= 3:
            score += 25
        elif headway <= 5:
            score += 20
        elif headway <= 10:
            score += 12
        elif headway <= 15:
            score += 5

        # 3. Track congestion is already between 0 and 1
        score += track_congestion * 25

        # 4. Speed reduction compared with section average
        if current_speed > 0 and section_average_speed > 0:

            speed_ratio = current_speed / section_average_speed

            if speed_ratio < 0.4:
                score += 20
            elif speed_ratio < 0.6:
                score += 15
            elif speed_ratio < 0.8:
                score += 8
            elif speed_ratio < 1.0:
                score += 3

        # 5. Delay
        if current_delay >= 30:
            score += 15
        elif current_delay >= 20:
            score += 12
        elif current_delay >= 10:
            score += 8
        elif current_delay >= 5:
            score += 3

        return min(round(score, 2), 100)

    def get_congestion_level(self, score: float) -> str:
        if score >= 70:
            return "HIGH"

        if score >= 40:
            return "MODERATE"

        return "LOW"

    def estimate_signal_wait(
        self,
        score: float,
        headway: float
    ) -> float:
        """
        Estimates signal waiting time in minutes.
        This is an estimated value, not direct signal data.
        """

        if score >= 70:
            return round(max(8, headway * 1.5), 2)

        if score >= 40:
            return round(max(3, headway * 0.8), 2)

        return round(max(0, headway * 0.3), 2)


signal_congestion_calculator = SignalCongestionCalculator()