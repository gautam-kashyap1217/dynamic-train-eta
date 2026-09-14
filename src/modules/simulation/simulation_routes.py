from fastapi import APIRouter, HTTPException, BackgroundTasks

from src.modules.simulation.simulation_service import simulation_service
from src.modules.simulation.simulation_schemas import SimulationState

router = APIRouter(
    prefix="/api/v1/simulation",
    tags=["Simulation"]
)


@router.get("/{train_number}/eta")
def get_simulation_eta(train_number: str):
    from src.modules.eta.eta_update_manager import eta_update_manager

    eta_data = eta_update_manager.get_latest_eta(train_number)

    if eta_data is None:
        raise HTTPException(
            status_code=404,
            detail=(
                f"No ETA available for simulated train "
                f"{train_number}. Start simulation first."
            )
        )

    return {
        "status": "success",
        "train_number": train_number,
        "eta": eta_data
    }


@router.get("/{train_number}", response_model=SimulationState)
def get_simulation_state(train_number: str):
    state = simulation_service.get_train_state(train_number)

    if state is None:
        raise HTTPException(
            status_code=404,
            detail=f"No simulation found for train {train_number}"
        )

    return state


@router.post("/{train_number}/start", response_model=SimulationState)
def start_simulation(
    train_number: str,
    background_tasks: BackgroundTasks
):
    try:
        existing_state = simulation_service.get_train_state(train_number)

        # Prevent starting duplicate simulation loops
        if existing_state is not None:
            return existing_state

        state = simulation_service.initialize_train(train_number)

        background_tasks.add_task(
            simulation_service.run_simulation,
            train_number
        )

        return state

    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error)
        )