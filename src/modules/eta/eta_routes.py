from fastapi import APIRouter, HTTPException

from src.modules.eta.eta_schemas import ETARequest, ETAResponse
from src.modules.eta.eta_service import eta_service
from src.modules.train.train_service import train_service

from src.integrations.railway.railradar_client import railradar_client


router = APIRouter(
    prefix="/api/v1/train",
    tags=["ETA"]
)


@router.get("/{train_id}/eta", response_model=ETAResponse)
def get_train_eta(train_id: str):

    try:
        # ---------------------------------------------------------
        # 1. Find train mapping
        # ---------------------------------------------------------

        train_info = train_service.get_train_mapping(train_id)

        if train_info is None:
            raise ValueError(
                f"No train mapping found for {train_id}"
            )

        internal_train_id = train_info["train_id"]
        train_number = train_info["train_number"]

        # ---------------------------------------------------------
        # 2. Fetch actual live status from RailRadar
        # ---------------------------------------------------------

        live_response = railradar_client.get_live_train_status(
            train_number
        )

        if not live_response or not live_response.get("success"):
            raise ValueError(
                f"Live status unavailable for train {train_number}"
            )

        live_data = live_response.get("data", {})

        current_location = live_data.get(
            "currentLocation",
            {}
        )

        next_halt = live_data.get(
            "nextHalt",
            {}
        )

        current_station = (
            current_location.get("stationCode")
            or current_location.get("stationName")
        )

        next_station = (
            next_halt.get("stationCode")
            or next_halt.get("stationName")
        )

        current_delay = max(
            float(
                current_location.get(
                    "delayMinutes",
                    live_data.get("delayMinutes", 0)
                )
                or 0
            ),
            0.0
        )

        # ---------------------------------------------------------
        # 3. Validate live route information
        # ---------------------------------------------------------

        if not current_station:
            raise ValueError(
                "Current station is unavailable from live data"
            )

        if not next_station:
            raise ValueError(
                "Next station is unavailable from live data"
            )

        # ---------------------------------------------------------
        # 4. Prepare ETA request
        # ---------------------------------------------------------

        request = ETARequest(
            train_id=internal_train_id,
            train_number=train_number
        )

        # ---------------------------------------------------------
        # 5. Generate ETA using the actual live segment
        # ---------------------------------------------------------

        result = eta_service.predict_eta(
            request=request,
            current_station=current_station,
            next_station=next_station,
            current_delay=current_delay
        )

        return result

    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error)
        )

    except HTTPException:
        raise

    except Exception as error:
        print("ETA route error:", error)

        raise HTTPException(
            status_code=500,
            detail="Unable to generate ETA prediction."
        )