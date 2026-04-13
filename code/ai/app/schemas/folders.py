from pydantic import BaseModel, Field


class FolderCreateRequest(BaseModel):
    folder_path: str = Field(
        ...,
        examples=["documents/contracts/2026", "users\\001\\avatars"],
        description="Folder-like path to be normalized into a MinIO prefix.",
    )


class FolderCreateResponse(BaseModel):
    folder_path: str
    prefix: str
    bucket: str
    url: str


class FolderItem(BaseModel):
    name: str
    path: str
    prefix: str


class FolderListResponse(BaseModel):
    current_path: str
    bucket: str
    folders: list[FolderItem]


class FolderDeleteRequest(BaseModel):
    folder_path: str = Field(
        ...,
        examples=["documents/contracts/2026", "users\\001\\avatars"],
        description="Folder-like path to delete recursively from MinIO.",
    )


class FolderDeleteResponse(BaseModel):
    folder_path: str
    prefix: str
    bucket: str
    deleted_objects: int


class FolderBulkDeleteRequest(BaseModel):
    folder_paths: list[str] = Field(
        ...,
        examples=[
            ["documents/contracts/2025", "documents/contracts/2026"],
            ["users/001/avatars", "users/001/documents"],
        ],
        description="Folder-like paths to delete recursively from MinIO.",
        min_length=1,
    )


class FolderBulkDeleteItemResponse(BaseModel):
    folder_path: str
    success: bool
    prefix: str | None = None
    bucket: str | None = None
    deleted_objects: int | None = None
    status_code: int | None = None
    error: str | None = None


class FolderBulkDeleteResponse(BaseModel):
    total: int
    succeeded: int
    failed: int
    results: list[FolderBulkDeleteItemResponse]


class FolderRenameRequest(BaseModel):
    current_path: str = Field(
        ...,
        examples=["documents/contracts/2026", "users\\001\\avatars"],
        description="Current folder-like path to rename.",
    )
    new_path: str = Field(
        ...,
        examples=["documents/contracts/2027", "users\\001\\profile-images"],
        description="New folder-like path.",
    )


class FolderRenameResponse(BaseModel):
    old_path: str
    old_prefix: str
    new_path: str
    new_prefix: str
    bucket: str
    moved_objects: int
