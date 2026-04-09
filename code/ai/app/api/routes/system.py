from fastapi import APIRouter

from app.schemas.system import HealthResponse, RootResponse


router = APIRouter(tags=["system"])


@router.get("/", response_model=RootResponse, summary="Root endpoint")
async def root() -> RootResponse:
    return RootResponse(message="FastAPI backend is running")


@router.get("/health", response_model=HealthResponse, summary="Health check")
async def health() -> HealthResponse:
    return HealthResponse(status="ok")
