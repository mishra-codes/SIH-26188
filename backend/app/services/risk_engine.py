from dataclasses import dataclass


@dataclass
class RiskResult:
    score: int
    status: str
    reasons: list[str]


def calculate_risk(
    *,
    mrz_valid: bool,
    expiry_status: str,
    tampering_score: float,
    tampering_status: str,
) -> RiskResult:
    """
    Combine deterministic document checks and ML forensic signals
    into an explainable screening risk score.

    This is a PoC risk-fusion layer, not a production fraud decision model.
    """

    score = 0
    reasons = []

    # ---------------------------------------------------------
    # MRZ validation
    # ---------------------------------------------------------

    if not mrz_valid:
        score += 35
        reasons.append(
            "MRZ validation failed."
        )

    # ---------------------------------------------------------
    # Expiry validation
    # ---------------------------------------------------------

    if expiry_status == "FAIL":
        score += 25
        reasons.append(
            "Passport expiry validation failed."
        )

    # ---------------------------------------------------------
    # Forensic ML signal
    # ---------------------------------------------------------

    if tampering_status == "SUSPICIOUS":
        # Tampering model contributes up to 40 points.
        tampering_points = round(
            min(40, tampering_score * 0.40)
        )

        score += tampering_points

        reasons.append(
            f"Forensic ML detected a potential tampering signal "
            f"({tampering_score:.2f}% probability)."
        )

    # ---------------------------------------------------------
    # Clamp score
    # ---------------------------------------------------------

    score = min(100, max(0, score))

    # ---------------------------------------------------------
    # Screening thresholds
    # ---------------------------------------------------------

    if score >= 70:
        status = "HIGH-RISK"
    elif score >= 30:
        status = "REVIEW"
    else:
        status = "CLEAR"

    # ---------------------------------------------------------
    # No suspicious signals
    # ---------------------------------------------------------

    if not reasons:
        reasons.append(
            "No significant verification anomalies detected."
        )

    return RiskResult(
        score=score,
        status=status,
        reasons=reasons,
    )