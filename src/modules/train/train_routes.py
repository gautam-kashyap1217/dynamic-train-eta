from fastapi import APIRouter, HTTPException

from src.core.database import db
from src.integrations.railway.railradar_client import railradar_client


router = APIRouter(
    prefix="/api/v1/trains",
    tags=["Trains"]
)


@router.get("/")
def get_trains():
    """
    Get all available trains.
    """

    df = db.get_train_details()

    if df is None or df.empty:
        return {
            "status": "success",
            "count": 0,
            "trains": []
        }

    trains = df.to_dict(orient="records")

    return {
        "status": "success",
        "count": len(trains),
        "trains": trains
    }


@router.get("/{train_number}")
def get_train(train_number: str):
    """
    Get details of a specific train.
    """

    df = db.get_train_details()

    if df is None or df.empty:
        raise HTTPException(
            status_code=404,
            detail="Train data not available"
        )

    # Convert train number to string so CSV values like
    # 12345.0 don't cause matching problems.
    train_column = None

    for column in df.columns:
        if column.lower() in [
            "train_number",
            "train_no",
            "train_num",
            "train"
        ]:
            train_column = column
            break

    if train_column is None:
        raise HTTPException(
            status_code=500,
            detail="Train number column not found in dataset"
        )

    result = df[
        df[train_column].astype(str).str.strip() == str(train_number).strip()
    ]

    if result.empty:
        raise HTTPException(
            status_code=404,
            detail=f"Train {train_number} not found"
        )

    return {
        "status": "success",
        "train": result.to_dict(orient="records")
    }


@router.get("/{train_number}/live-status")
def get_live_train_status(train_number: str):
    """
    Get live train status from RailRadar API.
    """

    try:
        result = railradar_client.get_live_train_status(
            train_number
        )

        if not result or not result.get("success"):
            raise HTTPException(
                status_code=404,
                detail=f"Live status not available for train {train_number}"
            )

        return result

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch live train status: {str(e)}"
        )