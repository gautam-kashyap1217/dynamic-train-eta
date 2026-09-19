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
        self.quantile_preprocessor = (
            self.quantile_artifact["preprocessor"]
        )

        self.feature_columns = self.base_artifact["feature_columns"]

        print("ETA models loaded successfully.")
        print(
            f"Expected features: "
            f"{len(self.feature_columns)}"
        )

        print(
            "Quantile model type:",
            type(self.quantile_model).__name__
        )

        print(
            "Number of ensemble estimators:",
            len(
                getattr(
                    self.quantile_model,
                    "estimators_",
                    []
                )
            )
        )

    def predict(
        self,
        features_df: pd.DataFrame
    ) -> dict:
        """
        Generate P10, P50, and P90 ETA predictions.

        The quantile model is a RandomForestRegressor.

        P10/P50/P90 are calculated from predictions
        produced by the individual trees in the ensemble.

        Additional ensemble uncertainty statistics are
        returned so the ETA service can calculate an
        uncertainty-based confidence indicator.
        """

        if features_df is None or features_df.empty:
            raise ValueError(
                "Feature data cannot be empty."
            )

        missing_features = [
            feature
            for feature in self.feature_columns
            if feature not in features_df.columns
        ]

        if missing_features:
            raise ValueError(
                f"Missing model features: "
                f"{missing_features}"
            )

        features_df = features_df[
            self.feature_columns
        ].copy()

        processed_features = (
            self.quantile_preprocessor.transform(
                features_df
            )
        )

        estimators = getattr(
            self.quantile_model,
            "estimators_",
            None
        )

        if not estimators:
            raise ValueError(
                "Quantile model does not contain "
                "individual estimators."
            )

        tree_predictions = np.array(
            [
                tree.predict(
                    processed_features
                )[0]
                for tree in estimators
            ],
            dtype=float
        )

        if tree_predictions.size == 0:
            raise ValueError(
                "No tree predictions were generated."
            )

        # ---------------------------------------------------------
        # QUANTILE PREDICTIONS
        # ---------------------------------------------------------

        p10 = np.quantile(
            tree_predictions,
            0.10
        )

        p50 = np.quantile(
            tree_predictions,
            0.50
        )

        p90 = np.quantile(
            tree_predictions,
            0.90
        )

        # Ensure the returned range is ordered.
        ordered_values = sorted(
            [
                float(p10),
                float(p50),
                float(p90),
            ]
        )

        p10, p50, p90 = ordered_values

        # ---------------------------------------------------------
        # ENSEMBLE UNCERTAINTY
        # ---------------------------------------------------------

        ensemble_mean = float(
            np.mean(tree_predictions)
        )

        ensemble_std = float(
            np.std(
                tree_predictions,
                ddof=0
            )
        )

        ensemble_min = float(
            np.min(tree_predictions)
        )

        ensemble_max = float(
            np.max(tree_predictions)
        )

        interval_width = max(
            p90 - p10,
            0.0
        )

        safe_p50 = max(
            abs(float(p50)),
            1.0
        )

        relative_interval_width = (
            interval_width / safe_p50
        )

        relative_std = (
            ensemble_std / safe_p50
        )

        print(
            "ML ensemble prediction:",
            {
                "p10": round(p10, 2),
                "p50": round(p50, 2),
                "p90": round(p90, 2),
                "ensemble_mean": round(
                    ensemble_mean,
                    2
                ),
                "ensemble_std": round(
                    ensemble_std,
                    2
                ),
                "ensemble_min": round(
                    ensemble_min,
                    2
                ),
                "ensemble_max": round(
                    ensemble_max,
                    2
                ),
                "relative_interval_width": round(
                    relative_interval_width,
                    4
                ),
                "relative_std": round(
                    relative_std,
                    4
                ),
            }
        )

        return {
            "p10": round(
                float(p10),
                2
            ),

            "p50": round(
                float(p50),
                2
            ),

            "p90": round(
                float(p90),
                2
            ),

            "ensemble_mean": round(
                ensemble_mean,
                2
            ),

            "ensemble_std": round(
                ensemble_std,
                2
            ),

            "ensemble_min": round(
                ensemble_min,
                2
            ),

            "ensemble_max": round(
                ensemble_max,
                2
            ),

            "interval_width": round(
                interval_width,
                2
            ),

            "relative_interval_width": round(
                relative_interval_width,
                4
            ),

            "relative_std": round(
                relative_std,
                4
            ),
        }


inference_engine = InferenceEngine()