import joblib
import numpy as np
import pandas as pd

from pathlib import Path


MODEL_DIR = Path(__file__).resolve().parent / "models"


class InferenceEngine:
    def __init__(self):
        self.base_artifact = None
        self.quantile_artifact = None

        self.base_model = None
        self.quantile_model = None

        self.base_preprocessor = None
        self.quantile_preprocessor = None

        self.feature_columns = []

        self._load_models()

    def _load_models(self):
        base_path = MODEL_DIR / "final_eta_model.joblib"
        quantile_path = MODEL_DIR / "rf_quantile_models.joblib"

        if not base_path.exists():
            raise FileNotFoundError(
                f"Base ETA model not found: {base_path}"
            )

        if not quantile_path.exists():
            raise FileNotFoundError(
                f"Quantile ETA model not found: {quantile_path}"
            )

        self.base_artifact = joblib.load(base_path)
        self.quantile_artifact = joblib.load(quantile_path)

        self.base_model = self.base_artifact["final_base_model"]
        self.base_preprocessor = self.base_artifact["preprocessor"]

        self.quantile_model = self.quantile_artifact["final_model"]
        self.quantile_preprocessor = self.quantile_artifact["preprocessor"]

        self.feature_columns = self.base_artifact["feature_columns"]

        print("ETA models loaded successfully.")
        print(f"Expected features: {len(self.feature_columns)}")

    def predict(self, features_df: pd.DataFrame) -> dict:
        """
        Generate P10, P50, and P90 ETA predictions.

        The quantile model is a RandomForestRegressor.
        Quantiles are calculated from predictions of its 300 individual trees.
        """

        if features_df is None or features_df.empty:
            raise ValueError("Feature data cannot be empty.")

        missing_features = [
            feature
            for feature in self.feature_columns
            if feature not in features_df.columns
        ]

        if missing_features:
            raise ValueError(
                f"Missing model features: {missing_features}"
            )

        features_df = features_df[self.feature_columns].copy()

        processed_features = self.quantile_preprocessor.transform(
            features_df
        )

        tree_predictions = np.array([
            tree.predict(processed_features)[0]
            for tree in self.quantile_model.estimators_
        ])

        p10 = np.quantile(tree_predictions, 0.10)
        p50 = np.quantile(tree_predictions, 0.50)
        p90 = np.quantile(tree_predictions, 0.90)

        return {
            "p10": round(float(p10), 2),
            "p50": round(float(p50), 2),
            "p90": round(float(p90), 2)
        }


inference_engine = InferenceEngine()