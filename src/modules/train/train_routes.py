from fastapi import APIRouter, HTTPException

from src.core.database import db
from src.modules.train.train_repository import train_repository


router = APIRouter(
    prefix="/api/v1/trains",
    tags=["Trains"]
)


@router.get("/")
def get_trains():
    """
    Get all available trains from the local dataset.
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


@router.get("/real")
def get_real_trains():
    """
    Get the real train directory from RailRadar.
    """

    try:
        data = train_repository.get_real_trains()

        return {
            "status": "success",
            "trains": data
        }

    except Exception as error:
        raise HTTPException(
            status_code=502,
            detail=f"Unable to fetch real train directory: {str(error)}"
        )


@router.get("/{train_number}/details")
def get_train_details(train_number: str):
    """
    Get scheduled timetable and station details from RailRadar.
    """

    try:
        result = train_repository.get_train_details(
            train_number
        )

        if not result:
            raise HTTPException(
                status_code=404,
                detail=(
                    f"Train timetable not available "
                    f"for {train_number}"
                )
            )

        return result

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=502,
            detail=f"Unable to fetch train timetable: {str(error)}"
        )


@router.get("/{train_number}/live")
def get_live_train(train_number: str):
    """
    Get real-time live status of a train from RailRadar.

    Supports both synthetic IDs and real train numbers.
    """

    try:
        data = train_repository.get_live_train_status(
            train_number
        )

        if data is None:
            raise HTTPException(
                status_code=404,
                detail=(
                    f"Live data not available "
                    f"for train {train_number}"
                )
            )

        return {
            "status": "success",
            "train": data
        }

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=502,
            detail=f"Unable to fetch live train data: {str(error)}"
        )


@router.get("/{train_number}/live-status")
def get_live_train_status(train_number: str):
    """
    Get live train status from RailRadar.

    This endpoint currently returns the live response directly.
    The frontend can use the timetable endpoint separately
    when live movement is unavailable.
    """

    try:
        result = train_repository.get_live_train_status(
            train_number
        )

        if not result or not result.get("success"):
            raise HTTPException(
                status_code=404,
                detail=(
                    f"Live status not available "
                    f"for train {train_number}"
                )
            )

        return result

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch live train status: {str(error)}"
        )


@router.get("/{train_number}")
def get_train(train_number: str):
    """
    Get details of a specific train from the local dataset.
    """

    df = db.get_train_details()

    if df is None or df.empty:
        raise HTTPException(
            status_code=404,
            detail="Train data not available"
        )

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
        df[train_column].astype(str).str.strip()
        == str(train_number).strip()
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