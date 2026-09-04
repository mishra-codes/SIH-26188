from pathlib import Path

import joblib
import pandas as pd

from ml.src.evaluation.metrics import calculate_classification_metrics
from ml.src.features.forensics import extract_forensic_features


MANIFEST_PATH = Path("data/processed/dataset_manifest_split.csv")
MODEL_PATH = Path("ml/models/tampering_random_forest.joblib")

FEATURE_COLUMNS = [
    "width",
    "height",
    "aspect_ratio",
    "brightness_mean",
    "brightness_std",
    "entropy",
    "edge_density",
    "noise_std",
    "local_variation",
]


def build_feature_matrix(df: pd.DataFrame) -> pd.DataFrame:
    features = []

    for image_path in df["image_path"]:
        extracted = extract_forensic_features(image_path)

        features.append(
            [extracted[column] for column in FEATURE_COLUMNS]
        )

    return pd.DataFrame(
        features,
        columns=FEATURE_COLUMNS,
    )


def evaluate_model():
    if not MANIFEST_PATH.exists():
        raise FileNotFoundError(
            f"Manifest not found: {MANIFEST_PATH}"
        )

    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Model not found: {MODEL_PATH}"
        )

    manifest = pd.read_csv(MANIFEST_PATH)

    test_df = manifest[
        manifest["split"] == "test"
    ].copy()

    if test_df.empty:
        raise ValueError("Test split is empty.")

    checkpoint = joblib.load(MODEL_PATH)

    model = checkpoint["model"]

    X_test = build_feature_matrix(test_df)
    y_test = test_df["label"].astype(int)

    predictions = model.predict(X_test)

    metrics = calculate_classification_metrics(
        y_test,
        predictions,
    )

    print()
    print("=== Tampering Model Evaluation ===")
    print(f"Test samples: {len(test_df)}")
    print()

    for name, value in metrics.items():
        print(f"{name}: {value}")

    print()
    print("=== Predictions ===")

    results = test_df[
        [
            "image_path",
            "label",
            "tampering_type",
            "document_id",
        ]
    ].copy()

    results["prediction"] = predictions

    print(results.to_string(index=False))

    return metrics


if __name__ == "__main__":
    evaluate_model()