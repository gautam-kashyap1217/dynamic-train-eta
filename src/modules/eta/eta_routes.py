from fastapi import APIRouter

router = APIRouter(
    prefix="/api/v1/eta",
    tags=["ETA"]
)


@router.get("/")
def get_eta():
    return {
        "message": "ETA module is working"
    }