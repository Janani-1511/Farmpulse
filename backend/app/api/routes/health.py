from datetime import datetime, timezone
from fastapi import APIRouter
from app.utils.config import settings

router = APIRouter()

@router.get("/health")
def health_check():
    """
    Health check endpoint returning system status and configuration information.
    """
    return {
        "status": "ok",
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.APP_ENV,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "message": "FarmPulse API Connected"
    }
