from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.api.verification import router as verification_router


app = FastAPI(
    title="SIH26188 Document Screening API",
    description="AI-assisted passport and identity document screening system",
    version="0.1.0",
)


# Allow the Vite React frontend to communicate with the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "document-screening-api",
    }


app.include_router(verification_router)