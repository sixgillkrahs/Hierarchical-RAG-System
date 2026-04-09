from functools import lru_cache
from os import environ, getenv
from pathlib import Path

from pydantic import BaseModel, Field


class Settings(BaseModel):
    app_name: str = Field(default="Hierarchical RAG Backend")
    app_version: str = Field(default="0.1.0")
    app_description: str = Field(
        default="FastAPI backend scaffold with MinIO file upload support."
    )
    app_host: str = Field(default="0.0.0.0")
    app_port: int = Field(default=8000)
    app_reload: bool = Field(default=True)
    minio_endpoint: str = Field(default="127.0.0.1:9000")
    minio_access_key: str = Field(default="minioadmin")
    minio_secret_key: str = Field(default="minioadmin")
    minio_bucket: str = Field(default="uploads")
    minio_secure: bool = Field(default=False)
    minio_public_base_url: str = Field(default="http://127.0.0.1:9000")


def load_dotenv_file(dotenv_path: str = ".env") -> None:
    env_file = Path(dotenv_path)
    if not env_file.exists():
        return

    for raw_line in env_file.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and getenv(key) is None:
            environ[key] = value


@lru_cache
def get_settings() -> Settings:
    load_dotenv_file()
    return Settings(
        app_name=getenv("APP_NAME", "Hierarchical RAG Backend"),
        app_version=getenv("APP_VERSION", "0.1.0"),
        app_description=getenv(
            "APP_DESCRIPTION",
            "FastAPI backend scaffold with MinIO file upload support.",
        ),
        app_host=getenv("APP_HOST", "0.0.0.0"),
        app_port=int(getenv("APP_PORT", "8000")),
        app_reload=getenv("APP_RELOAD", "true").lower() == "true",
        minio_endpoint=getenv("MINIO_ENDPOINT", "127.0.0.1:9000"),
        minio_access_key=getenv("MINIO_ACCESS_KEY", "minioadmin"),
        minio_secret_key=getenv("MINIO_SECRET_KEY", "minioadmin"),
        minio_bucket=getenv("MINIO_BUCKET", "uploads"),
        minio_secure=getenv("MINIO_SECURE", "false").lower() == "true",
        minio_public_base_url=getenv(
            "MINIO_PUBLIC_BASE_URL",
            "http://127.0.0.1:9000",
        ).rstrip("/"),
    )
