from fastapi import APIRouter, HTTPException

from src.modules.eta.eta_schemas import ETARequest, ETAResponse
from src.modules.eta.eta_service import eta_service
from src.modules.simulation.simulation_service import simulation_service


router = APIRouter(
    prefix="/api/v1/train",
    tags=["ETA"]
)


@router.get("/{train_id}/eta", response_model=ETAResponse)
def get_train_eta(train_id: str):

    try:
        request = ETARequest(train_id=train_id)

        state = simulation_service.get_train_state(train_id)

        if state is None:
            raise ValueError(
                f"No simulation state found for train {train_id}"
            )

        result = eta_service.predict_eta(
            request=request,
            current_station=state.current_station,
            next_station=state.next_station,
            current_delay=state.current_delay_min
        )

        return result

    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )