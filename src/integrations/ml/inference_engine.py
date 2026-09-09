import joblib
import pandas as pd
from src.config.paths import ETA_MODEL_PATH

class InferenceEngine:
    """Loads the pre-trained LightGBM joblib model artifact and executes quantile delay predictions."""
    
    def __init__(self):
        self.model = None
        self._load_model()

    def _load_model(self):
        if ETA_MODEL_PATH.exists():
            try:
                self.model = joblib.load(ETA_MODEL_PATH)
            except Exception as e:
                print(f"Warning: Could not load model artifact: {e}")

    def predict_eta_quantiles(self, features_df: pd.DataFrame) -> dict:
        """Returns P10, P50, and P90 quantile arrival forecasts."""
        if self.model is None:
            # Fallback mock predictions if model artifact isn't compiled yet
            return {"p10": 10.0, "p50": 15.0, "p90": 25.0}
        
        # Real inference call when model artifact is present
        predictions = self.model.predict(features_df)
        return {"p10": float(predictions[0][0]), "p50": float(predictions[0][1]), "p90": float(predictions[0][2])}

inference_engine = InferenceEngine()