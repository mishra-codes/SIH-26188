from dataclasses import dataclass
from datetime import datetime
import re


@dataclass
class MRZValidationResult:
    valid: bool
    document_number: str | None
    date_of_birth: str | None
    date_of_expiry: str | None
    nationality: str | None
    sex: str | None

    document_number_valid: bool
    date_of_birth_valid: bool
    date_of_expiry_valid: bool
    composite_valid: bool

    errors: list[str]


def _char_value(char: str) -> int:
    if char == "<":
        return 0

    if "0" <= char <= "9":
        return int(char)

    if "A" <= char <= "Z":
        return ord(char) - ord("A") + 10

    return 0


def _check_digit(data: str) -> str:
    weights = [7, 3, 1]
    total = 0

    for index, char in enumerate(data):
        total += _char_value(char) * weights[index % 3]

    return str(total % 10)


def _validate_check_digit(data: str, expected: str) -> bool:
    if not expected.isdigit():
        return False

    return _check_digit(data) == expected


def _format_date(value: str, expiry: bool = False) -> str | None:
    if not re.fullmatch(r"\d{6}", value):
        return None

    year = int(value[:2])
    month = int(value[2:4])
    day = int(value[4:6])

    if expiry:
        year += 2000
    else:
        year += 1900 if year >= 50 else 2000

    try:
        return datetime(year, month, day).strftime("%Y-%m-%d")
    except ValueError:
        return None


def validate_passport_mrz(
    line1: str,
    line2: str,
) -> MRZValidationResult:

    errors = []

    line1 = line1.upper().replace(" ", "")
    line2 = line2.upper().replace(" ", "")

    # Default validation states.
    document_number_valid = False
    date_of_birth_valid = False
    date_of_expiry_valid = False
    composite_valid = False

    if len(line1) != 44:
        errors.append(
            f"MRZ line 1 must contain 44 characters, got {len(line1)}"
        )

    if len(line2) != 44:
        errors.append(
            f"MRZ line 2 must contain 44 characters, got {len(line2)}"
        )

    if errors:
        return MRZValidationResult(
            valid=False,
            document_number=None,
            date_of_birth=None,
            date_of_expiry=None,
            nationality=None,
            sex=None,
            document_number_valid=False,
            date_of_birth_valid=False,
            date_of_expiry_valid=False,
            composite_valid=False,
            errors=errors,
        )

    # ---------------------------------------------------------
    # TD3 PASSPORT MRZ STRUCTURE
    # ---------------------------------------------------------
    #
    # LINE 1
    # 0-1     Document type
    # 2       Issuing state
    # 5-43    Name / optional name data
    #
    # LINE 2
    # 0-8     Document number
    # 9       Document number check digit
    # 10-12   Nationality
    # 13-18   Date of birth
    # 19      DOB check digit
    # 20      Sex
    # 21-26   Date of expiry
    # 27      Expiry check digit
    # 28-42   Optional data
    # 43      Final composite check digit
    # ---------------------------------------------------------

    document_number = line2[0:9]
    document_number_check = line2[9]

    nationality = line2[10:13]

    dob_raw = line2[13:19]
    dob_check = line2[19]

    sex = line2[20]

    expiry_raw = line2[21:27]
    expiry_check = line2[27]

    final_check = line2[43]

    # ---------------------------------------------------------
    # CHECK DIGITS
    # ---------------------------------------------------------

    document_number_valid = _validate_check_digit(
        document_number,
        document_number_check,
    )

    if not document_number_valid:
        errors.append(
            "Document number check digit failed."
        )

    date_of_birth_valid = _validate_check_digit(
        dob_raw,
        dob_check,
    )

    if not date_of_birth_valid:
        errors.append(
            "Date of birth check digit failed."
        )

    date_of_expiry_valid = _validate_check_digit(
        expiry_raw,
        expiry_check,
    )

    if not date_of_expiry_valid:
        errors.append(
            "Date of expiry check digit failed."
        )

    # Composite checksum.
    composite_data = (
        line2[0:10]
        + line2[13:20]
        + line2[21:43]
    )

    composite_valid = _validate_check_digit(
        composite_data,
        final_check,
    )

    if not composite_valid:
        errors.append(
            "Final MRZ composite check digit failed."
        )

    # ---------------------------------------------------------
    # DATE VALIDATION
    # ---------------------------------------------------------

    dob = _format_date(dob_raw)

    if dob is None:
        errors.append(
            "Invalid date of birth."
        )

    expiry = _format_date(
        expiry_raw,
        expiry=True,
    )

    if expiry is None:
        errors.append(
            "Invalid date of expiry."
        )

    valid = len(errors) == 0

    return MRZValidationResult(
        valid=valid,

        document_number=document_number.replace(
            "<",
            "",
        ),

        date_of_birth=dob,

        date_of_expiry=expiry,

        nationality=nationality.replace(
            "<",
            "",
        ),

        sex=sex,

        document_number_valid=document_number_valid,

        date_of_birth_valid=date_of_birth_valid,

        date_of_expiry_valid=date_of_expiry_valid,

        composite_valid=composite_valid,

        errors=errors,
    )