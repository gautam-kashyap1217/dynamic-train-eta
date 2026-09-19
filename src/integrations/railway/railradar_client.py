import httpx

from src.config.env import settings


class RailRadarRateLimitError(Exception):
    """
    Raised when RailRadar returns HTTP 429.

    We intentionally do not retry automatically because repeated
    retries can make the rate-limit situation worse.
    """

    def __init__(
        self,
        message: str,
        retry_after: str | None = None
    ):
        super().__init__(message)
        self.retry_after = retry_after


class RailRadarClient:

    BASE_URL = "https://api.railradar.in/v1"

    def _get_headers(self):
        return {
            "Authorization": f"Bearer {settings.RAILRADAR_API_KEY}",
            "Accept": "application/json",
            "User-Agent": "DynamicTrainETA/1.0",
        }

    @staticmethod
    def _handle_response(
        response: httpx.Response,
        endpoint: str
    ):
        """
        Handle common RailRadar responses.

        IMPORTANT:
        We do not automatically retry HTTP 429.
        """

        if response.status_code == 429:

            retry_after = response.headers.get(
                "Retry-After"
            )

            print(
                "RailRadar rate limit reached."
            )

            print(
                "Endpoint:",
                endpoint
            )

            print(
                "Status:",
                response.status_code
            )

            if retry_after:
                print(
                    "RailRadar Retry-After:",
                    retry_after
                )
            else:
                print(
                    "RailRadar did not provide "
                    "a Retry-After header."
                )

            raise RailRadarRateLimitError(
                (
                    "RailRadar API rate limit reached "
                    f"for {endpoint}"
                ),
                retry_after=retry_after
            )

        response.raise_for_status()

        return response.json()

    def get_live_train_status(
        self,
        train_number: str,
        authoritative: bool = True
    ):
        """
        Get real-time live running status of a train.

        No automatic retry is performed on HTTP 429.
        """

        url = (
            f"{self.BASE_URL}/trains/"
            f"{train_number}/live"
        )

        params = {
            "authoritative": str(
                authoritative
            ).lower()
        }

        print(
            "RailRadar live-status request:",
            url,
            params
        )

        response = httpx.get(
            url,
            headers=self._get_headers(),
            params=params,
            timeout=10.0
        )

        return self._handle_response(
            response=response,
            endpoint="live_train_status"
        )

    def get_train_details(
        self,
        train_number: str
    ):
        """
        Get scheduled train timetable and complete
        station sequence from RailRadar.
        """

        url = (
            f"{self.BASE_URL}/trains/"
            f"{train_number}"
        )

        params = {
            "haltsOnly": "false"
        }

        print(
            "RailRadar train-details request:",
            url,
            params
        )

        response = httpx.get(
            url,
            headers=self._get_headers(),
            params=params,
            timeout=10.0
        )

        return self._handle_response(
            response=response,
            endpoint="train_details"
        )

    def get_ntes_trains(self):
        """
        Get the real train directory from NTES/RailRadar.
        """

        url = (
            f"{self.BASE_URL}/lookup/"
            f"trains/ntes"
        )

        print(
            "RailRadar NTES train-directory request:",
            url
        )

        response = httpx.get(
            url,
            headers=self._get_headers(),
            timeout=10.0
        )

        return self._handle_response(
            response=response,
            endpoint="ntes_trains"
        )

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

        print(
            "RailRadar trains-between request:",
            url
        )

        response = httpx.get(
            url,
            headers=self._get_headers(),
            timeout=10.0
        )

        return self._handle_response(
            response=response,
            endpoint="trains_between_stations"
        )

    def get_train_route(
        self,
        train_number: str
    ):
        """
        Get train route geometry and station information.
        """

        url = (
            f"{self.BASE_URL}/trains/"
            f"{train_number}/route"
        )

        params = {
            "format": "geojson",
            "stops": "true"
        }

        print(
            "RailRadar train-route request:",
            url,
            params
        )

        response = httpx.get(
            url,
            headers=self._get_headers(),
            params=params,
            timeout=10.0
        )

        return self._handle_response(
            response=response,
            endpoint="train_route"
        )


railradar_client = RailRadarClient()