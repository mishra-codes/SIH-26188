from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier

from ml.src.features.forensics import extract_forensic_features


MANIFEST_PATH = Path("data/processed/dataset_manifest_split.csv")
MODEL_DIR = Path("ml/models")
MODEL_PATH = MODEL_DIR / "tampering_random_forest.joblib"

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


def build_feature_matrix(df: pd.DataFrame):
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


def train_model():
    if not MANIFEST_PATH.exists():
        raise FileNotFoundError(
            f"Dataset manifest not found: {MANIFEST_PATH}"
        )

    manifest = pd.read_csv(MANIFEST_PATH)

    train_df = manifest[manifest["split"] == "train"].copy()

    if train_df.empty:
        raise ValueError("Training split is empty.")

    print(f"Training samples: {len(train_df)}")

    X_train = build_feature_matrix(train_df)
    y_train = train_df["label"].astype(int)

    model = RandomForestClassifier(
        n_estimators=200,
        random_state=42,
        class_weight="balanced",
        n_jobs=-1,
    )

    model.fit(X_train, y_train)

    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    joblib.dump(
        {
            "model": model,
            "feature_columns": FEATURE_COLUMNS,
            "model_version": "poc-v1",
        },
        MODEL_PATH,
    )

    print(f"Model saved to: {MODEL_PATH}")

    print()
    print("=== Feature Importance ===")

    importance = pd.Series(
        model.feature_importances_,
        index=FEATURE_COLUMNS,
    ).sort_values(ascending=False)

    print(importance.to_string())

    return model
if __name__ == "__main__":
    train_model()