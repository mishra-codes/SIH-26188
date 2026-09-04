from pathlib import Path
from tempfile import NamedTemporaryFile

from fastapi import APIRouter, File, HTTPException, UploadFile

from backend.app.schemas.verification import VerificationResponse
from backend.app.services.verification_service import verify_document


router = APIRouter(prefix="/verify", tags=["Verification"])


ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
}


@router.post("", response_model=VerificationResponse)
async def verify_passport(
    file: UploadFile = File(...),
):
    """
    Upload a passport image and run the verification pipeline.
    """

    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Only JPEG and PNG images are supported.",
        )

    suffix = Path(file.filename or "").suffix.lower()

    if suffix not in {".jpg", ".jpeg", ".png"}:
        raise HTTPException(
            status_code=400,
            detail="Invalid file extension.",
        )

    try:
        file_bytes = await file.read()

        if not file_bytes:
            raise HTTPException(
                status_code=400,
                detail="Uploaded file is empty.",
            )

        with NamedTemporaryFile(
            delete=False,
            suffix=suffix,
        ) as temp_file:
            temp_file.write(file_bytes)
            temp_path = temp_file.name

        try:
            result = verify_document(temp_path)
            return result

        finally:
            Path(temp_path).unlink(missing_ok=True)

    except HTTPException:
        raise

    except FileNotFoundError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Verification failed: {exc}",
        ) from exc