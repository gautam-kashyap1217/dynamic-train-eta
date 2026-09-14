import httpx

from src.config.env import settings


class RailRadarClient:

    BASE_URL = "https://api.railradar.in/v1"

    def _get_headers(self):
        return {
            "Authorization": f"Bearer {settings.RAILRADAR_API_KEY}"
        }

    def get_live_train_status(
        self,
        train_number: str,
        authoritative: bool = True
    ):
        """
        Get real-time live running status of a train from RailRadar.
        """

        url = f"{self.BASE_URL}/trains/{train_number}/live"

        params = {
            "authoritative": str(authoritative).lower()
        }

        response = httpx.get(
            url,
            headers=self._get_headers(),
            params=params,
            timeout=10.0
        )

        response.raise_for_status()

        return response.json()

    def get_train_details(self, train_number: str):
        """
        Get scheduled train timetable and complete station sequence
        from RailRadar.
        """

        url = f"{self.BASE_URL}/trains/{train_number}"

        params = {
            "haltsOnly": "false"
        }

        response = httpx.get(
            url,
            headers=self._get_headers(),
            params=params,
            timeout=10.0
        )

        response.raise_for_status()

        return response.json()

    def get_ntes_trains(self):
        """
        Get the real train directory from NTES/RailRadar.
        """

        url = f"{self.BASE_URL}/lookup/trains/ntes"

        response = httpx.get(
            url,
            headers=self._get_headers(),
            timeout=10.0
        )

        response.raise_for_status()

        return response.json()

    def get_trains_between_stations(
        self,
        from_station: str,
        to_station: str
    ):
        """
        Get trains operating between two stations.
        """

        url = (
            f"{self.BASE_URL}/trains/between/"
            f"{from_station}/{to_station}"
        )

        response = httpx.get(
            url,
            headers=self._get_headers(),
            timeout=10.0
        )

        response.raise_for_status()

        return response.json()

    def get_train_route(self, train_number: str):
        """
        Get train route geometry and station information.
        """

        url = f"{self.BASE_URL}/trains/{train_number}/route"

        params = {
            "format": "geojson",
            "stops": "true"
        }

        response = httpx.get(
            url,
            headers=self._get_headers(),
            params=params,
            timeout=10.0
        )

        response.raise_for_status()

        return response.json()


railradar_client = RailRadarClient()