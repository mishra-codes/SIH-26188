from pathlib import Path

import joblib
import pandas as pd

from ml.src.features.forensics import extract_forensic_features
from ml.src.inference.result import (
    AnomalyResult,
    FaceResult,
    MLVerificationResult,
    TamperingResult,
)


MODEL_VERSION = "poc-v0.2"

MODEL_PATH = (
    Path(__file__).resolve().parents[3]
    / "ml"
    / "models"
    / "tampering_random_forest.joblib"
)


def _load_model():
    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Tampering model not found: {MODEL_PATH}"
        )

    checkpoint = joblib.load(MODEL_PATH)

    if not isinstance(checkpoint, dict):
        raise ValueError("Invalid tampering model checkpoint.")

    if "model" not in checkpoint:
        raise ValueError("Model checkpoint does not contain 'model'.")

    if "feature_columns" not in checkpoint:
        raise ValueError(
            "Model checkpoint does not contain 'feature_columns'."
        )

    return checkpoint


def analyze_passport(image_path: str) -> MLVerificationResult:
    """
    Run the ML verification pipeline on a passport/document image.

    Current PoC:
    - forensic feature extraction
    - Random Forest tampering classification

    Future modules:
    - anomaly detection
    - face verification
    """

    path = Path(image_path)

    if not path.exists():
        raise FileNotFoundError(
            f"Document image not found: {image_path}"
        )

    checkpoint = _load_model()

    model = checkpoint["model"]
    feature_columns = checkpoint["feature_columns"]
    model_version = checkpoint.get("model_version", MODEL_VERSION)

    features = extract_forensic_features(str(path))

    feature_data = pd.DataFrame([features])

    missing_features = [
        column
        for column in feature_columns
        if column not in feature_data.columns
    ]

    if missing_features:
        raise ValueError(
            f"Missing required model features: {missing_features}"
        )

    feature_data = feature_data[feature_columns]

    tampering_probability = float(
        model.predict_proba(feature_data)[0][1]
    )

    prediction = int(
        model.predict(feature_data)[0]
    )

    tampering_score = round(tampering_probability * 100, 2)

    if prediction == 1:
        tampering_status = "SUSPICIOUS"
    else:
        tampering_status = "PASS"

    signals = [
        f"Random Forest tampering probability: {tampering_score:.2f}%"
    ]

    if prediction == 1:
        signals.append("Classifier predicted potential document tampering.")
    else:
        signals.append("No tampering detected by the current classifier.")

    return MLVerificationResult(
        model_version=model_version,
        tampering=TamperingResult(
            score=tampering_score,
            status=tampering_status,
            signals=signals,
        ),
        anomaly=AnomalyResult(
            score=0.0,
            status="NOT_RUN",
            signals=[],
        ),
        face=FaceResult(
            match_score=None,
            status="NOT_RUN",
        ),
    )