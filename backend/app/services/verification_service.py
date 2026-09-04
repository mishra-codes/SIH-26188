from pathlib import Path

from backend.app.schemas.verification import (
    DocumentInfo,
    VerificationChecks,
    VerificationResponse,
)


def verify_document(image_path: str) -> VerificationResponse:
    """
    Main verification orchestrator.

    Individual verification modules will be connected here:
    - OCR
    - MRZ validation
    - expiry validation
    - tampering ML
    - face verification
    - consistency checks
    - risk engine
    """

    path = Path(image_path)

    if not path.exists():
        raise FileNotFoundError(f"Document not found: {image_path}")

    # Temporary response until the individual services are integrated.
    checks = VerificationChecks()

    return VerificationResponse(
        status="REVIEW",
        risk_score=50,
        document=DocumentInfo(
            document_type="passport",
        ),
        checks=checks,
        reasons=[
            "Verification pipeline initialized; detailed checks not yet connected."
        ],
    )