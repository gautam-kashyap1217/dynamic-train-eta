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
        # 1. Resolve train ID and train number
        # ---------------------------------------------------------

        train_info = train_service.get_train_mapping(train_id)

        if train_info is None:
            # If the frontend sends an actual railway number,
            # such as 11078, use it directly.
            internal_train_id = str(train_id).strip()
            train_number = str(train_id).strip()

        else:
            # If the frontend sends a synthetic ID such as TRN10000,
            # use the real train number from TRAIN_MAPPING.
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

        # Debugging output
        print("FULL LIVE DATA:", live_data)

        # ---------------------------------------------------------
        # 3. Extract current location and next halt
        # ---------------------------------------------------------

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

        # ---------------------------------------------------------
        # 4. Extract current delay
        # ---------------------------------------------------------

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
        # 5. Validate live route information
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
        # 6. Prepare ETA request
        # ---------------------------------------------------------

        request = ETARequest(
            train_id=internal_train_id,
            train_number=train_number
        )

        # ---------------------------------------------------------
        # 7. Generate ETA prediction
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