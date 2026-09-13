from fastapi import APIRouter, HTTPException, Query

from src.modules.congestion.congestion_service import (
    congestion_service
)

router = APIRouter(
    prefix="/api/v1/congestion",
    tags=["Congestion"]
)


@router.get("/")
def get_congestion(
    limit: int = Query(default=50, ge=1, le=500),
    offset: int = Query(default=0, ge=0)
):
    data = congestion_service.get_congestion_data(
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
def get_latest_congestion():
    data = congestion_service.get_latest_congestion()

    if data is None:
        raise HTTPException(
            status_code=404,
            detail="Congestion data not available"
        )

    return {
        "status": "success",
        "congestion": data
    }