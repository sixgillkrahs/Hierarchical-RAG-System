from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.concurrency import run_in_threadpool

from app.dependencies.storage import get_storage_service
from app.schemas.files import FileUploadResponse
from app.services.storage import (
    EmptyUploadError,
    StorageConnectionError,
    StorageService,
    StorageUploadError,
)


router = APIRouter(prefix="/files", tags=["files"])


@router.post(
    "/upload",
    response_model=FileUploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload a file to object storage",
)
async def upload_file(
    file: UploadFile = File(...),
    folder_path: str | None = Form(default=None),
    storage_service: StorageService = Depends(get_storage_service),
) -> FileUploadResponse:
    try:
        result = await run_in_threadpool(
            storage_service.upload_file,
            file,
            folder_path or "",
        )
    except EmptyUploadError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except StorageConnectionError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc
    except StorageUploadError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        ) from exc

    return FileUploadResponse.model_validate(result)
