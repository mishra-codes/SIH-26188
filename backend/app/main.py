from fastapi import FastAPI

from backend.app.api.verification import router as verification_router


app = FastAPI(
    title="SIH26188 Document Screening API",
    description="AI-assisted passport and identity document screening system",
    version="0.1.0",
)


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "document-screening-api",
    }


app.include_router(verification_router)