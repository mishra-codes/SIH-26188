from datetime import date, datetime


def validate_expiry(expiry_date: str | None) -> tuple[str, str | None]:
    """
    Validate whether the passport expiry date is still valid.

    Returns:
        ("PASS", None) if valid
        ("FAIL", reason) if expired or invalid
    """

    if not expiry_date:
        return "FAIL", "Passport expiry date could not be determined."

    try:
        expiry = datetime.strptime(
            expiry_date,
            "%Y-%m-%d",
        ).date()
    except ValueError:
        return "FAIL", "Passport expiry date has an invalid format."

    if expiry < date.today():
        return "FAIL", "Passport is expired."

    return "PASS", None