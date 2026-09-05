from ml.src.inference.ocr_service import extract_passport_ocr
from ml.src.inference.mrz_validator import validate_passport_mrz


def verify_passport_identity(image_path: str) -> dict:
    """
    Run OCR, extract the passport MRZ, and validate
    the TD3 MRZ check digits.
    """

    ocr_result = extract_passport_ocr(image_path)

    mrz_lines = ocr_result["mrz_lines"]

    if len(mrz_lines) < 2:
        return {
            "ocr": {
                "status": "PASS" if ocr_result["texts"] else "FAIL",
                "texts": ocr_result["texts"],
            },
            "mrz": {
                "status": "FAIL",
                "valid": False,
                "errors": [
                    "Could not extract two MRZ lines."
                ],
            },
        }

    # Use the first two detected MRZ lines.
    line1 = mrz_lines[0]
    line2 = mrz_lines[1]

    mrz_result = validate_passport_mrz(
        line1,
        line2,
    )

    return {
        "ocr": {
            "status": "PASS",
            "texts": ocr_result["texts"],
        },
        "mrz": {
            "status": "PASS" if mrz_result.valid else "FAIL",
            "valid": mrz_result.valid,

            "document_number": mrz_result.document_number,
            "date_of_birth": mrz_result.date_of_birth,
            "date_of_expiry": mrz_result.date_of_expiry,
            "nationality": mrz_result.nationality,
            "sex": mrz_result.sex,

            "checks": {
                "document_number": mrz_result.document_number_valid,
                "date_of_birth": mrz_result.date_of_birth_valid,
                "date_of_expiry": mrz_result.date_of_expiry_valid,
                "composite": mrz_result.composite_valid,
            },

            "errors": mrz_result.errors,
        },
    }