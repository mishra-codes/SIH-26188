from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier

from ml.src.features.forensics import extract_forensic_features


MANIFEST_PATH = Path("data/processed/dataset_manifest_split.csv")
MODEL_DIR = Path("ml/models")
MODEL_PATH = MODEL_DIR / "tampering_random_forest.joblib"


def build_feature_matrix(df: pd.DataFrame) -> pd.DataFrame:
    features = []

    for image_path in df["image_path"]:
        extracted = extract_forensic_features(image_path)
        features.append(extracted)

    return pd.DataFrame(features).fillna(0.0)


def train_model():
    if not MANIFEST_PATH.exists():
        raise FileNotFoundError(
            f"Dataset manifest not found: {MANIFEST_PATH}"
        )

    manifest = pd.read_csv(MANIFEST_PATH)

    train_df = manifest[
        manifest["split"] == "train"
    ].copy()

    if train_df.empty:
        raise ValueError("Training split is empty.")

    print(f"Training samples: {len(train_df)}")

    X_train = build_feature_matrix(train_df)
    y_train = train_df["label"].astype(int)

    feature_columns = list(X_train.columns)

    print(f"Features used: {len(feature_columns)}")

    model = RandomForestClassifier(
        n_estimators=200,
        random_state=42,
        class_weight="balanced",
        n_jobs=-1,
    )

    model.fit(X_train, y_train)

    MODEL_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    joblib.dump(
        {
            "model": model,
            "feature_columns": feature_columns,
            "model_version": "poc-v0.2",
        },
        MODEL_PATH,
    )

    print(f"Model saved to: {MODEL_PATH}")

    print()
    print("=== Feature Importance ===")

    importance = pd.Series(
        model.feature_importances_,
        index=feature_columns,
    ).sort_values(
        ascending=False
    )

    print(importance.head(20).to_string())

    return model


if __name__ == "__main__":
    train_model()