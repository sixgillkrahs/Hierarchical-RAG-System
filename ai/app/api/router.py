from fastapi import APIRouter

from app.api.routes.files import router as files_router
from app.api.routes.folders import router as folders_router
from app.api.routes.system import router as system_router


api_router = APIRouter()
api_router.include_router(system_router)
api_router.include_router(files_router)
api_router.include_router(folders_router)
