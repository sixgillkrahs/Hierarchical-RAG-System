from functools import lru_cache

from app.core.config import get_settings
from app.services.storage import MinioStorageService, StorageService


@lru_cache
def get_storage_service() -> StorageService:
    return MinioStorageService(get_settings())
