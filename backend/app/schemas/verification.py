from typing import List, Optional

from pydantic import BaseModel, Field


class DocumentInfo(BaseModel):
    document_type: str = "passport"
    passport_number: Optional[str] = None
    name: Optional[str] = None
    nationality: Optional[str] = None
    date_of_birth: Optional[str] = None
    date_of_expiry: Optional[str] = None
    issuing_country: Optional[str] = None


class MRZChecks(BaseModel):
    document_number: bool = False
    date_of_birth: bool = False
    date_of_expiry: bool = False
    composite: bool = False


class MRZInfo(BaseModel):
    valid: bool = False
    checks: MRZChecks = Field(default_factory=MRZChecks)
    errors: List[str] = Field(default_factory=list)


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

    risk_score: int = Field(
        ge=0,
        le=100,
    )

    document: DocumentInfo

    checks: VerificationChecks

    mrz: MRZInfo = Field(
        default_factory=MRZInfo
    )

    reasons: List[str] = Field(
        default_factory=list
    )