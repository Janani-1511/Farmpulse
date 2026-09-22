from datetime import datetime, timezone
from fastapi import APIRouter
from app.utils.config import settings

router = APIRouter()

@router.get("/health")
def health_check():
    """
    Health check endpoint returning system status and configuration information.
    """
    from app.services.prediction_service import get_model_status
    return {
        "status": "ok",
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.APP_ENV,
        "model_status": get_model_status(),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "message": "FarmPulse API Connected"
    }
