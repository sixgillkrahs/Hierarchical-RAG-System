from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.concurrency import run_in_threadpool

from app.dependencies.storage import get_storage_service
from app.schemas.folders import (
    FolderCreateRequest,
    FolderCreateResponse,
    FolderDeleteRequest,
    FolderDeleteResponse,
    FolderListResponse,
    FolderRenameRequest,
    FolderRenameResponse,
)
from app.services.storage import (
    FolderConflictError,
    FolderNotFoundError,
    InvalidStoragePathError,
    StorageConnectionError,
    StorageService,
    StorageUploadError,
)


router = APIRouter(prefix="/folders", tags=["folders"])


@router.get(
    "",
    response_model=FolderListResponse,
    status_code=status.HTTP_200_OK,
    summary="List direct child folders of the current path",
)
async def list_folders(
    current_path: str = Query(
        default="",
        description="Current folder path. Leave empty to list root folders.",
        examples=["", "documents/contracts", "users\\001"],
    ),
    storage_service: StorageService = Depends(get_storage_service),
) -> FolderListResponse:
    try:
        result = await run_in_threadpool(
            storage_service.list_folder_prefixes,
            current_path,
        )
    except InvalidStoragePathError as exc:
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

    return FolderListResponse.model_validate(result)


@router.post(
    "",
    response_model=FolderCreateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a prefix to simulate a folder in MinIO",
)
async def create_folder(
    payload: FolderCreateRequest,
    storage_service: StorageService = Depends(get_storage_service),
) -> FolderCreateResponse:
    try:
        result = await run_in_threadpool(
            storage_service.create_folder_prefix,
            payload.folder_path,
        )
    except InvalidStoragePathError as exc:
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

    return FolderCreateResponse.model_validate(result)


@router.delete(
    "",
    response_model=FolderDeleteResponse,
    status_code=status.HTTP_200_OK,
    summary="Delete a folder prefix recursively from MinIO",
)
async def delete_folder(
    payload: FolderDeleteRequest,
    storage_service: StorageService = Depends(get_storage_service),
) -> FolderDeleteResponse:
    try:
        result = await run_in_threadpool(
            storage_service.delete_folder_prefix,
            payload.folder_path,
        )
    except InvalidStoragePathError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except FolderNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
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

    return FolderDeleteResponse.model_validate(result)


@router.patch(
    "",
    response_model=FolderRenameResponse,
    status_code=status.HTTP_200_OK,
    summary="Rename a folder prefix by copying objects to a new prefix",
)
async def rename_folder(
    payload: FolderRenameRequest,
    storage_service: StorageService = Depends(get_storage_service),
) -> FolderRenameResponse:
    try:
        result = await run_in_threadpool(
            storage_service.rename_folder_prefix,
            payload.current_path,
            payload.new_path,
        )
    except InvalidStoragePathError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except FolderNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc
    except FolderConflictError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
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

    return FolderRenameResponse.model_validate(result)
