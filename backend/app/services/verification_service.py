from pathlib import Path
from time import perf_counter

from backend.app.schemas.verification import (
    DocumentInfo,
    MRZChecks,
    MRZInfo,
    VerificationChecks,
    VerificationResponse,
)
from backend.app.services.expiry_validator import validate_expiry
from backend.app.services.risk_engine import calculate_risk
from ml.src.inference.pipeline import analyze_passport
from ml.src.inference.passport_verification import verify_passport_identity


def verify_document(image_path: str) -> VerificationResponse:
    total_start = perf_counter()

    path = Path(image_path)

    if not path.exists():
        raise FileNotFoundError(
            f"Document not found: {image_path}"
        )

    # ---------------------------------------------------------
    # OCR + MRZ
    # ---------------------------------------------------------
    start = perf_counter()

    passport_result = verify_passport_identity(
        str(path)
    )

    ocr_mrz_time = perf_counter() - start

    ocr_result = passport_result["ocr"]
    mrz_result = passport_result["mrz"]

    # OCR fallback fields
    ocr_fields = passport_result.get(
        "ocr_fields",
        {},
    )

    # ---------------------------------------------------------
    # Expiry validation
    # ---------------------------------------------------------
    start = perf_counter()

    expiry_status, expiry_reason = validate_expiry(
        mrz_result.get("date_of_expiry")
    )

    expiry_time = perf_counter() - start

    # ---------------------------------------------------------
    # Forensic ML
    # ---------------------------------------------------------
    start = perf_counter()

    ml_result = analyze_passport(
        str(path)
    )

    ml_time = perf_counter() - start

    tampering = ml_result.tampering

    # ---------------------------------------------------------
    # Risk engine
    # ---------------------------------------------------------
    start = perf_counter()

    risk_result = calculate_risk(
        mrz_valid=mrz_result.get(
            "valid",
            False,
        ),
        expiry_status=expiry_status,
        tampering_score=tampering.score,
        tampering_status=tampering.status,
    )

    risk_time = perf_counter() - start

    status = risk_result.status
    risk_score = risk_result.score
    reasons = risk_result.reasons

    # ---------------------------------------------------------
    # Additional reasons
    # ---------------------------------------------------------
    if ocr_result["status"] == "FAIL":
        reasons.append(
            "OCR failed to extract readable passport text."
        )

    if mrz_result["status"] == "FAIL":
        reasons.append(
            "MRZ validation failed."
        )

    if expiry_reason:
        reasons.append(expiry_reason)

    # ---------------------------------------------------------
    # Verification checks
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
    # Timing
    # ---------------------------------------------------------
    total_time = perf_counter() - total_start

    print(
        f"[TIMING] "
        f"OCR+MRZ={ocr_mrz_time:.2f}s | "
        f"Expiry={expiry_time:.4f}s | "
        f"ML={ml_time:.2f}s | "
        f"Risk={risk_time:.4f}s | "
        f"TOTAL={total_time:.2f}s"
    )

    # ---------------------------------------------------------
    # Document information
    #
    # Prefer validated MRZ values.
    # Use OCR fallback when MRZ cannot provide a value.
    # ---------------------------------------------------------
    passport_number = (
        mrz_result.get("document_number")
        or ocr_fields.get("passport_number")
    )

    nationality = (
        mrz_result.get("nationality")
        or ocr_fields.get("nationality")
    )

    date_of_birth = (
        mrz_result.get("date_of_birth")
        or ocr_fields.get("date_of_birth")
    )

    date_of_expiry = (
        mrz_result.get("date_of_expiry")
        or ocr_fields.get("date_of_expiry")
    )

    name = (
    mrz_result.get("name")
    or ocr_fields.get("name")
        )

    issuing_country = mrz_result.get(
            "issuing_country"
        )

    # ---------------------------------------------------------
    # Final API response
    # ---------------------------------------------------------
    return VerificationResponse(
        status=status,
        risk_score=risk_score,

        document=DocumentInfo(
            document_type="passport",
            passport_number=passport_number,
            name=name,
            nationality=nationality,
            date_of_birth=date_of_birth,
            date_of_expiry=date_of_expiry,
            issuing_country=issuing_country
        ),

        checks=checks,

        mrz=MRZInfo(
            valid=mrz_result.get(
                "valid",
                False,
            ),

            checks=MRZChecks(
                document_number=mrz_result.get(
                    "checks",
                    {},
                ).get(
                    "document_number",
                    False,
                ),

                date_of_birth=mrz_result.get(
                    "checks",
                    {},
                ).get(
                    "date_of_birth",
                    False,
                ),

                date_of_expiry=mrz_result.get(
                    "checks",
                    {},
                ).get(
                    "date_of_expiry",
                    False,
                ),

                composite=mrz_result.get(
                    "checks",
                    {},
                ).get(
                    "composite",
                    False,
                ),
            ),

            errors=mrz_result.get(
                "errors",
                [],
            ),
        ),

        reasons=reasons,
    )