from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.modules.train.train_routes import router as train_router
from src.modules.eta.eta_routes import router as eta_router
from src.modules.station.station_routes import router as station_router


app = FastAPI(
    title="Dynamic Train ETA Backend",
    description="Backend API for Dynamic Train ETA Forecasting System",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(train_router)
app.include_router(eta_router)
app.include_router(station_router)


@app.get("/")
def root():
    return {
        "message": "Dynamic Train ETA API is running successfully.",
        "status": "online"
    }


@app.get("/health")
def health_check():
    return {
        "status_code": 200,
        "status": "healthy"
    }
        