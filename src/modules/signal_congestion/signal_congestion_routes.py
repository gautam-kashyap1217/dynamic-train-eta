from fastapi import APIRouter, HTTPException, Query

from src.modules.signal_congestion.signal_congestion_service import (
    signal_congestion_service
)


router = APIRouter(
    prefix="/api/v1/signal-congestion",
    tags=["Signal Congestion"]
)


@router.get("/")
def get_signal_congestion(
    limit: int = Query(default=50, ge=1, le=500),
    offset: int = Query(default=0, ge=0)
):
    data = signal_congestion_service.get_all_congestion(
        limit=limit,
        offset=offset
    )

    return {
        "status": "success",
        "count": len(data),
        "limit": limit,
        "offset": offset,
        "congestion": data
    }


@router.get("/latest")
def get_latest_signal_congestion():
    data = signal_congestion_service.get_latest_congestion()

    if data is None:
        raise HTTPException(
            status_code=404,
            detail="Signal congestion data not available"
        )

    return {
        "status": "success",
        "congestion": data
    }


@router.get("/live/{train_number}")
def get_live_signal_congestion(train_number: str):
    data = signal_congestion_service.get_live_congestion(
        train_number
    )

    if data is None:
        raise HTTPException(
            status_code=404,
            detail="Live and fallback congestion data unavailable"
        )

    return {
        "status": "success",
        "train_number": train_number,
        "congestion": data
    }


@router.get("/section/{index}")
def get_section_signal_congestion(index: int):
    data = signal_congestion_service.get_congestion_by_index(index)

    if data is None:
        raise HTTPException(
            status_code=404,
            detail=f"Signal congestion record {index} not found"
        )

    return {
        "status": "success",
        "congestion": data
    }