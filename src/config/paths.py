from pathlib import Path

# Root project directory
ROOT_DIR = Path(__file__).resolve().parent.parent.parent

# Data and Models directories
DATA_DIR = ROOT_DIR / "data"
MODELS_DIR = ROOT_DIR / "models"
STATION_WEATHER_DIR = DATA_DIR / "station_weather"

# Specific file paths
COMBINED_SCHEDULE_PATH = DATA_DIR / "combined_schedule.csv"
TRAIN_DETAILS_PATH = DATA_DIR / "train_details.csv"
DELAY_HISTORY_PATH = DATA_DIR / "delay_analytics_history.csv"
GRAPH_EDGE_WEIGHTS_PATH = DATA_DIR / "graph_edge_weights.csv"
ML_TRAINING_FEATURES_PATH = DATA_DIR / "ml_training_features.csv"
QUICK_STATS_PATH = DATA_DIR / "frontend_quick_stats.json"
STATIONS_GEOJSON_PATH = DATA_DIR / "prototype_stations.geojson"
STATION_NAMES_PATH = DATA_DIR / "station_full_names.csv"

# Model artifact paths
ETA_MODEL_PATH = MODELS_DIR / "spatial_graph_eta_model.joblib"
METRICS_PATH = MODELS_DIR / "graph_model_evaluation_metrics.json"