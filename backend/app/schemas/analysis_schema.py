from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class AnalysisRequest(BaseModel):
    crop: str = Field(..., example="Tomato")
    quantity: float = Field(..., gt=0, example=20.0)
    latitude: float = Field(..., example=11.0168)
    longitude: float = Field(..., example=76.9558)
    target_date: str = Field(..., example="2026-09-15")
    search_radius: Optional[float] = Field(100.0, ge=1.0, example=100.0)
    location_name: Optional[str] = Field("Detected Location", example="Coimbatore, Tamil Nadu")

class MarketResultItem(BaseModel):
    id: str
    market_name: str
    district: str
    state: str
    latitude: float
    longitude: float
    market_type: str
    distance_km: float
    distance_type: str = "road"
    distance_method: str = "OSRM Road Driving Distance Routing"
    current_price: float
    predicted_price: float
    model_status: Optional[str] = None
    is_ml_model: Optional[bool] = None
    transport_cost: float
    expected_revenue: float
    estimated_net_revenue: float
    weather: Optional[Dict[str, Any]] = None

class LocationInfo(BaseModel):
    name: str
    latitude: float
    longitude: float

class RecommendationInfo(BaseModel):
    type: str
    reason: str

class AnalysisResponse(BaseModel):
    crop: str
    quantity: float
    target_date: str
    location: LocationInfo
    markets: List[MarketResultItem]
    best_market: Dict[str, Any]
    recommendation: RecommendationInfo
    weather: Optional[Dict[str, Any]] = None
    disclaimer: str

