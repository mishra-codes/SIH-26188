from pathlib import Path

import joblib
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)

from ml.src.features.forensics import extract_forensic_features


PROJECT_ROOT = Path(__file__).resolve().parents[3]

MANIFEST_PATH = (
    PROJECT_ROOT
    / "data"
    / "processed"
    / "demo_dataset_manifest_split.csv"
)

MODEL_PATH = (
    PROJECT_ROOT
    / "ml"
    / "models"
    / "tampering_random_forest_demo.joblib"
)


def build_feature_matrix(df: pd.DataFrame) -> pd.DataFrame:
    features = []

    for image_path in df["image_path"]:
        full_path = PROJECT_ROOT / image_path
        extracted = extract_forensic_features(str(full_path))
        features.append(extracted)

    return pd.DataFrame(features).fillna(0.0)


def evaluate_model():
    manifest = pd.read_csv(MANIFEST_PATH)
    test_df = manifest[manifest["split"] == "test"].copy()

    checkpoint = joblib.load(MODEL_PATH)

    model = checkpoint["model"]
    feature_columns = checkpoint["feature_columns"]
    model_version = checkpoint.get("model_version", "unknown")

    X_test = build_feature_matrix(test_df)
    X_test = X_test[feature_columns]

    y_test = test_df["label"].astype(int)

    predictions = model.predict(X_test)
    probabilities = model.predict_proba(X_test)[:, 1]

    test_df["prediction"] = predictions
    test_df["probability"] = probabilities

    print()
    print("=== MODEL CONFIDENCE BY TEST DOCUMENT ===")
    print()

    for _, row in test_df.iterrows():
        actual = "TAMPERED" if row["label"] == 1 else "GENUINE"
        predicted = "SUSPICIOUS" if row["prediction"] == 1 else "PASS"

        print(
            f"{row['document_id']:8s} | "
            f"{row['tampering_type']:12s} | "
            f"Actual: {actual:8s} | "
            f"Predicted: {predicted:9s} | "
            f"Probability: {row['probability']:.4f}"
        )

    print()
    print("=== THRESHOLD ANALYSIS ===")
    print()

    for threshold in [0.50, 0.60, 0.70, 0.80, 0.90]:
        threshold_predictions = (
            probabilities >= threshold
        ).astype(int)

        tn, fp, fn, tp = confusion_matrix(
            y_test,
            threshold_predictions,
            labels=[0, 1],
        ).ravel()

        accuracy = accuracy_score(
            y_test,
            threshold_predictions,
        )

        precision = precision_score(
            y_test,
            threshold_predictions,
            zero_division=0,
        )

        recall = recall_score(
            y_test,
            threshold_predictions,
            zero_division=0,
        )

        f1 = f1_score(
            y_test,
            threshold_predictions,
            zero_division=0,
        )

        print(
            f"Threshold {threshold:.2f} | "
            f"Accuracy: {accuracy:.4f} | "
            f"Precision: {precision:.4f} | "
            f"Recall: {recall:.4f} | "
            f"F1: {f1:.4f} | "
            f"FP: {fp} | FN: {fn}"
        )

    print()
    print("Evaluation completed successfully.")


if __name__ == "__main__":
    evaluate_model()