from dataclasses import dataclass, field
from typing import List, Optional


@dataclass
class TamperingResult:
    score: float
    status: str
    signals: List[str] = field(default_factory=list)


@dataclass
class AnomalyResult:
    score: float
    status: str
    signals: List[str] = field(default_factory=list)


@dataclass
class FaceResult:
    match_score: Optional[float]
    status: str


@dataclass
class MLVerificationResult:
    model_version: str
    tampering: TamperingResult
    anomaly: AnomalyResult
    face: FaceResult

    def to_dict(self) -> dict:
        return {
            "model_version": self.model_version,
            "tampering": {
                "score": self.tampering.score,
                "status": self.tampering.status,
                "signals": self.tampering.signals,
            },
            "anomaly": {
                "score": self.anomaly.score,
                "status": self.anomaly.status,
                "signals": self.anomaly.signals,
            },
            "face": {
                "match_score": self.face.match_score,
                "status": self.face.status,
            },
        }