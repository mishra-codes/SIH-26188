from pathlib import Path

from backend.app.schemas.verification import (
    DocumentInfo,
    VerificationChecks,
    VerificationResponse,
)
from ml.src.inference.pipeline import analyze_passport


def verify_document(image_path: str) -> VerificationResponse:
    """
    Main verification orchestrator.

    Current PoC:
    - ML forensic tampering detection

    Future modules:
    - OCR
    - MRZ validation
    - expiry validation
    - face verification
    - cross-document consistency
    - risk fusion
    """

    path = Path(image_path)

    if not path.exists():
        raise FileNotFoundError(
            f"Document not found: {image_path}"
        )

    ml_result = analyze_passport(str(path))

    tampering = ml_result.tampering

    if tampering.status == "SUSPICIOUS":
        risk_score = min(100, round(tampering.score))
        status = "REVIEW"

        reasons = [
            "Potential document tampering detected by forensic ML analysis."
        ]
    else:
        risk_score = min(100, round(tampering.score))
        status = "CLEAR"

        reasons = [
            "No significant tampering detected by the current ML model."
        ]

    checks = VerificationChecks(
        ocr="NOT_RUN",
        mrz="NOT_RUN",
        expiry="NOT_RUN",
        tampering=tampering.status,
        face="NOT_RUN",
        consistency="NOT_RUN",
    )

    return VerificationResponse(
        status=status,
        risk_score=risk_score,
        document=DocumentInfo(
            document_type="passport",
        ),
        checks=checks,
        reasons=reasons,
    )