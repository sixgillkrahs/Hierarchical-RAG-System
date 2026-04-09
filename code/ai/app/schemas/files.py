from pydantic import BaseModel


class FileUploadResponse(BaseModel):
    filename: str
    object_name: str
    bucket: str
    content_type: str
    size: int
    url: str
