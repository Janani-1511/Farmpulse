from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import health, analysis, history, retail, auth
from app.utils.config import settings
from app.services.prediction_service import load_ml_models

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="FarmPulse Agricultural Market Price Prediction and Decision Support System API"
)


# Enable CORS for mobile application access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    load_ml_models()

# Register Routers
app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(analysis.router, prefix="/api", tags=["Analysis"])
app.include_router(history.router, prefix="/api", tags=["History"])
app.include_router(retail.router, prefix="/api", tags=["Retail"])


@app.get("/")
def root():
    return {
        "message": "Welcome to FarmPulse API",
        "health_check": "/api/health",
        "analyze_location": "/api/analyze-location",
        "price_history": "/api/history",
        "retail_prices": "/api/retail-prices",
        "docs": "/docs"
    }
