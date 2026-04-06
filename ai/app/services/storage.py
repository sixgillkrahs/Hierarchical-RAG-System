from io import BytesIO
from abc import ABC, abstractmethod
from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile
from minio import Minio
from minio.commonconfig import CopySource
from minio.deleteobjects import DeleteObject
from minio.error import S3Error

from app.core.config import Settings


class StorageError(Exception):
    pass


class EmptyUploadError(StorageError):
    pass


class StorageConnectionError(StorageError):
    pass


class StorageUploadError(StorageError):
    pass


class InvalidStoragePathError(StorageError):
    pass


class FolderNotFoundError(StorageError):
    pass


class FolderConflictError(StorageError):
    pass


class StorageService(ABC):
    @abstractmethod
    def upload_file(self, file: UploadFile) -> dict[str, str | int]:
        raise NotImplementedError

    @abstractmethod
    def create_folder_prefix(self, folder_path: str) -> dict[str, str]:
        raise NotImplementedError

    @abstractmethod
    def list_folder_prefixes(self, current_path: str = "") -> dict[str, str | list]:
        raise NotImplementedError

    @abstractmethod
    def delete_folder_prefix(self, folder_path: str) -> dict[str, str | int]:
        raise NotImplementedError

    @abstractmethod
    def rename_folder_prefix(
        self,
        current_path: str,
        new_path: str,
    ) -> dict[str, str | int]:
        raise NotImplementedError


class MinioStorageService(StorageService):
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.client = Minio(
            endpoint=settings.minio_endpoint,
            access_key=settings.minio_access_key,
            secret_key=settings.minio_secret_key,
            secure=settings.minio_secure,
        )

    def ensure_bucket_exists(self) -> None:
        try:
            if not self.client.bucket_exists(self.settings.minio_bucket):
                self.client.make_bucket(self.settings.minio_bucket)
        except S3Error as exc:
            raise StorageUploadError(
                f"Could not prepare MinIO bucket: {exc.code}"
            ) from exc
        except Exception as exc:
            raise StorageConnectionError("Could not connect to MinIO server.") from exc

    def _normalize_folder_path(
        self,
        folder_path: str,
        *,
        allow_empty: bool = False,
    ) -> str:
        normalized = folder_path.replace("\\", "/").strip().strip("/")
        parts = [part.strip() for part in normalized.split("/") if part.strip()]

        if not parts:
            if allow_empty:
                return ""
            raise InvalidStoragePathError("Folder path must not be empty.")

        if any(part in {".", ".."} for part in parts):
            raise InvalidStoragePathError(
                "Folder path cannot contain '.' or '..' segments."
            )

        return "/".join(parts)

    def create_folder_prefix(self, folder_path: str) -> dict[str, str]:
        self.ensure_bucket_exists()

        normalized_path = self._normalize_folder_path(folder_path)
        prefix = f"{normalized_path}/"

        try:
            self.client.put_object(
                bucket_name=self.settings.minio_bucket,
                object_name=prefix,
                data=BytesIO(b""),
                length=0,
                content_type="application/x-directory",
            )
        except S3Error as exc:
            raise StorageUploadError(
                f"Could not create folder prefix in MinIO: {exc.code}"
            ) from exc
        except Exception as exc:
            raise StorageConnectionError("Could not connect to MinIO server.") from exc

        return {
            "folder_path": normalized_path,
            "prefix": prefix,
            "bucket": self.settings.minio_bucket,
            "url": (
                f"{self.settings.minio_public_base_url}/"
                f"{self.settings.minio_bucket}/{prefix}"
            ),
        }

    def _list_object_names(self, prefix: str) -> list[str]:
        try:
            return [
                obj.object_name
                for obj in self.client.list_objects(
                    bucket_name=self.settings.minio_bucket,
                    prefix=prefix,
                    recursive=True,
                )
                if obj.object_name
            ]
        except S3Error as exc:
            raise StorageUploadError(
                f"Could not list folder prefixes in MinIO: {exc.code}"
            ) from exc
        except Exception as exc:
            raise StorageConnectionError("Could not connect to MinIO server.") from exc

    def list_folder_prefixes(self, current_path: str = "") -> dict[str, str | list]:
        self.ensure_bucket_exists()

        normalized_path = self._normalize_folder_path(current_path, allow_empty=True)
        prefix = f"{normalized_path}/" if normalized_path else ""
        folders: dict[str, dict[str, str]] = {}

        try:
            for obj in self.client.list_objects(
                bucket_name=self.settings.minio_bucket,
                prefix=prefix or None,
                recursive=False,
            ):
                object_name = obj.object_name
                if not object_name or object_name == prefix:
                    continue

                relative_name = object_name[len(prefix) :] if prefix else object_name
                relative_name = relative_name.strip("/")
                if not relative_name:
                    continue

                if getattr(obj, "is_dir", False):
                    folder_name = relative_name
                elif "/" in relative_name:
                    folder_name = relative_name.split("/", 1)[0]
                else:
                    continue

                folder_path = (
                    f"{normalized_path}/{folder_name}" if normalized_path else folder_name
                )

                if folder_name not in folders:
                    folders[folder_name] = {
                        "name": folder_name,
                        "path": folder_path,
                        "prefix": f"{folder_path}/",
                    }
        except S3Error as exc:
            raise StorageUploadError(
                f"Could not list folder prefixes in MinIO: {exc.code}"
            ) from exc
        except Exception as exc:
            raise StorageConnectionError("Could not connect to MinIO server.") from exc

        return {
            "current_path": normalized_path,
            "bucket": self.settings.minio_bucket,
            "folders": sorted(folders.values(), key=lambda item: item["name"].lower()),
        }

    def delete_folder_prefix(self, folder_path: str) -> dict[str, str | int]:
        self.ensure_bucket_exists()

        normalized_path = self._normalize_folder_path(folder_path)
        prefix = f"{normalized_path}/"
        object_names = self._list_object_names(prefix)

        if not object_names:
            raise FolderNotFoundError("Folder prefix does not exist.")

        delete_errors = list(
            self.client.remove_objects(
                bucket_name=self.settings.minio_bucket,
                delete_object_list=(DeleteObject(name) for name in object_names),
            )
        )
        if delete_errors:
            first_error = delete_errors[0]
            raise StorageUploadError(
                f"Could not delete folder prefix in MinIO: {first_error.code}"
            )

        return {
            "folder_path": normalized_path,
            "prefix": prefix,
            "bucket": self.settings.minio_bucket,
            "deleted_objects": len(object_names),
        }

    def rename_folder_prefix(
        self,
        current_path: str,
        new_path: str,
    ) -> dict[str, str | int]:
        self.ensure_bucket_exists()

        old_path = self._normalize_folder_path(current_path)
        target_path = self._normalize_folder_path(new_path)

        if old_path == target_path:
            raise InvalidStoragePathError("Current path and new path must be different.")

        old_prefix = f"{old_path}/"
        new_prefix = f"{target_path}/"

        source_object_names = self._list_object_names(old_prefix)
        if not source_object_names:
            raise FolderNotFoundError("Source folder prefix does not exist.")

        destination_object_names = self._list_object_names(new_prefix)
        if destination_object_names:
            raise FolderConflictError("Destination folder prefix already exists.")

        moved_count = 0
        copied_object_names: list[str] = []

        try:
            for object_name in source_object_names:
                new_object_name = f"{new_prefix}{object_name[len(old_prefix):]}"
                self.client.copy_object(
                    bucket_name=self.settings.minio_bucket,
                    object_name=new_object_name,
                    source=CopySource(self.settings.minio_bucket, object_name),
                )
                copied_object_names.append(new_object_name)
                moved_count += 1

            delete_errors = list(
                self.client.remove_objects(
                    bucket_name=self.settings.minio_bucket,
                    delete_object_list=(
                        DeleteObject(object_name) for object_name in source_object_names
                    ),
                )
            )
            if delete_errors:
                first_error = delete_errors[0]
                raise StorageUploadError(
                    f"Could not finalize folder rename in MinIO: {first_error.code}"
                )
        except S3Error as exc:
            raise StorageUploadError(
                f"Could not rename folder prefix in MinIO: {exc.code}"
            ) from exc
        except FolderConflictError:
            raise
        except StorageError:
            raise
        except Exception as exc:
            raise StorageConnectionError("Could not connect to MinIO server.") from exc

        return {
            "old_path": old_path,
            "old_prefix": old_prefix,
            "new_path": target_path,
            "new_prefix": new_prefix,
            "bucket": self.settings.minio_bucket,
            "moved_objects": moved_count,
        }

    def upload_file(self, file: UploadFile) -> dict[str, str | int]:
        self.ensure_bucket_exists()

        original_name = Path(file.filename or "upload.bin").name
        object_name = f"{uuid4()}-{original_name}"
        content_type = file.content_type or "application/octet-stream"

        file.file.seek(0, 2)
        file_size = file.file.tell()
        file.file.seek(0)

        if file_size == 0:
            raise EmptyUploadError("Uploaded file is empty.")

        try:
            self.client.put_object(
                bucket_name=self.settings.minio_bucket,
                object_name=object_name,
                data=file.file,
                length=file_size,
                content_type=content_type,
            )
        except S3Error as exc:
            raise StorageUploadError(
                f"File upload to MinIO failed: {exc.code}"
            ) from exc
        except Exception as exc:
            raise StorageConnectionError("Could not connect to MinIO server.") from exc

        return {
            "filename": original_name,
            "object_name": object_name,
            "bucket": self.settings.minio_bucket,
            "content_type": content_type,
            "size": file_size,
            "url": (
                f"{self.settings.minio_public_base_url}/"
                f"{self.settings.minio_bucket}/{object_name}"
            ),
        }
