from typing import Dict, List, Optional

from pydantic import BaseModel, Field


class DocumentInfo(BaseModel):
    document_type: str = "passport"
    passport_number: Optional[str] = None
    name: Optional[str] = None
    nationality: Optional[str] = None
    date_of_birth: Optional[str] = None
    date_of_expiry: Optional[str] = None


class VerificationChecks(BaseModel):
    ocr: str = "NOT_RUN"
    mrz: str = "NOT_RUN"
    expiry: str = "NOT_RUN"
    tampering: str = "NOT_RUN"
    face: str = "NOT_RUN"
    consistency: str = "NOT_RUN"


class VerificationResponse(BaseModel):
    status: str = Field(
        description="Overall screening decision: CLEAR, REVIEW, or HIGH-RISK"
    )
    risk_score: int = Field(ge=0, le=100)
    document: DocumentInfo
    checks: VerificationChecks
    reasons: List[str] = []