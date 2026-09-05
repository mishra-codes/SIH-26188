from pathlib import Path
from backend.app.schemas.verification import (
    DocumentInfo,
    MRZChecks,
    MRZInfo,
    VerificationChecks,
    VerificationResponse,
)

from backend.app.services.risk_engine import calculate_risk

from backend.app.services.expiry_validator import validate_expiry

from ml.src.inference.pipeline import analyze_passport
from ml.src.inference.passport_verification import verify_passport_identity


def verify_document(image_path: str) -> VerificationResponse:
    """
    Main verification orchestrator.

    Current PoC modules:
    - OCR
    - MRZ extraction and check-digit validation
    - ML forensic tampering detection

    Future modules:
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

    # ---------------------------------------------------------
    # 1. OCR + MRZ verification
    # ---------------------------------------------------------

    passport_result = verify_passport_identity(str(path))

    ocr_result = passport_result["ocr"]
    mrz_result = passport_result["mrz"]
    expiry_status, expiry_reason = validate_expiry(
        mrz_result.get("date_of_expiry")
    )

    # ---------------------------------------------------------
    # 2. Forensic ML tampering detection
    # ---------------------------------------------------------

    ml_result = analyze_passport(str(path))
    tampering = ml_result.tampering

    # ---------------------------------------------------------
    # 3. Extract document information from MRZ
    # ---------------------------------------------------------

    document = DocumentInfo(
        document_type="passport",
        passport_number=mrz_result.get("document_number"),
        nationality=mrz_result.get("nationality"),
        date_of_birth=mrz_result.get("date_of_birth"),
        date_of_expiry=mrz_result.get("date_of_expiry"),
    )

    # ---------------------------------------------------------
    # 4. Current PoC decision
    #
    # NOTE:
    # No risk fusion yet.
    # We keep the existing tampering-based decision logic.
    # ---------------------------------------------------------

    # ---------------------------------------------------------
# Risk fusion
# ---------------------------------------------------------

    risk_result = calculate_risk(
        mrz_valid=mrz_result.get("valid", False),
        expiry_status=expiry_status,
        tampering_score=tampering.score,
        tampering_status=tampering.status,
    )

    status = risk_result.status
    risk_score = risk_result.score
    reasons = risk_result.reasons


    # Add OCR/MRZ issues as additional explanations.
    if ocr_result["status"] == "FAIL":
        reasons.append("OCR failed to extract readable passport text.")

    if mrz_result["status"] == "FAIL":
        reasons.append("MRZ validation failed.")

    if expiry_reason:
        reasons.append(expiry_reason)

    # ---------------------------------------------------------
    # 5. Verification check statuses
    # ---------------------------------------------------------

    checks = VerificationChecks(
        ocr=ocr_result["status"],
        mrz=mrz_result["status"],
        expiry=expiry_status,
        tampering=tampering.status,
        face="NOT_RUN",
        consistency="NOT_RUN",
    )

    # ---------------------------------------------------------
    # 6. Final API response
    # ---------------------------------------------------------

    return VerificationResponse(
    status=status,
    risk_score=risk_score,
    document=document,
    checks=checks,
    mrz=MRZInfo(
        valid=mrz_result.get("valid", False),
        checks=MRZChecks(
            document_number=mrz_result.get("checks", {}).get(
                "document_number", False
            ),
            date_of_birth=mrz_result.get("checks", {}).get(
                "date_of_birth", False
            ),
            date_of_expiry=mrz_result.get("checks", {}).get(
                "date_of_expiry", False
            ),
            composite=mrz_result.get("checks", {}).get(
                "composite", False
            ),
        ),
        errors=mrz_result.get("errors", []),
    ),
    reasons=reasons,
)