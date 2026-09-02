from pathlib import Path

from .result import (
    AnomalyResult,
    FaceResult,
    MLVerificationResult,
    TamperingResult,
)


MODEL_VERSION = "poc-v1"


def analyze_passport(image_path: str) -> MLVerificationResult:
    """
    Run the ML verification pipeline on a passport image.

    This is the initial PoC baseline.
    Actual forensic and face models will be integrated later.
    """

    path = Path(image_path)

    if not path.exists():
        raise FileNotFoundError(f"Passport image not found: {image_path}")

    return MLVerificationResult(
        model_version=MODEL_VERSION,
        tampering=TamperingResult(
            score=0.0,
            status="NOT_RUN",
            signals=[],
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