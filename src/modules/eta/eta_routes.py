from fastapi import APIRouter, HTTPException

from src.modules.eta.eta_schemas import ETARequest, ETAResponse
from src.modules.eta.eta_service import eta_service
from src.modules.train.train_service import train_service
from src.modules.live_data.live_data_service import live_data_service


router = APIRouter(
    prefix="/api/v1/train",
    tags=["ETA"]
)


@router.get("/{train_id}/eta", response_model=ETAResponse)
def get_train_eta(train_id: str):
    try:
        # 1. Find train mapping
        train_info = train_service.get_train_mapping(train_id)

        if train_info is None:
            raise ValueError(
                f"No train mapping found for {train_id}"
            )

        internal_train_id = train_info["train_id"]
        train_number = train_info["train_number"]

        # 2. Get data from selected provider
        # synthetic or railradar based on DATA_SOURCE
        live_data = live_data_service.get_train_data(
            train_number
        )

        # 3. Validate live route information
        if not live_data.current_station:
            raise ValueError(
                "Current station is unavailable from live data"
            )

        if not live_data.next_station:
            raise ValueError(
                "Next station is unavailable from live data"
            )

        # 4. Prepare ETA request
        request = ETARequest(
            train_id=internal_train_id,
            train_number=train_number
        )

        # 5. Generate ETA
        result = eta_service.predict_eta(
        request=request,
        current_station=live_data.current_station,
        next_station=live_data.next_station,
        current_delay=live_data.delay_minutes,

        latitude=live_data.latitude,
        longitude=live_data.longitude,
        distance_travelled_km=live_data.distance_travelled_km,
        timestamp=live_data.timestamp.isoformat(),
        data_source=live_data.data_source,
        is_simulated=live_data.is_simulated
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