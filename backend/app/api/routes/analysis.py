from fastapi import APIRouter, HTTPException, status
from app.schemas.analysis_schema import AnalysisRequest, AnalysisResponse
from app.services.market_service import get_nearby_markets_analysis
from app.services.decision_service import evaluate_decision_recommendation

router = APIRouter()

@router.post("/analyze-location", response_model=AnalysisResponse)
def analyze_location(payload: AnalysisRequest):
    """
    Core GPS-Based Agricultural Market Intelligence Endpoint.
    1. Validates location, crop, quantity, and date.
    2. Finds nearby agricultural markets within search radius.
    3. Filters markets supporting the selected crop.
    4. Predicts target date modal price per market using Random Forest model.
    5. Computes transport costs and estimated net revenue.
    6. Returns sorted table data and best market recommendation.
    """
    if payload.quantity <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quantity must be greater than zero."
        )

    # Validate target_date is not in the past
    try:
        from datetime import datetime, date
        target_dt = datetime.strptime(payload.target_date, "%Y-%m-%d").date()
        today = date.today()
        if target_dt < today:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Target selling date ({payload.target_date}) cannot be in the past. Please select today or a future date."
            )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid target_date format. Expected YYYY-MM-DD."
        )

    search_radius = payload.search_radius if payload.search_radius and payload.search_radius > 0 else 100.0

    relevant_markets, nearby_markets = get_nearby_markets_analysis(
        user_lat=payload.latitude,
        user_lon=payload.longitude,
        crop=payload.crop,
        quantity=payload.quantity,
        target_date=payload.target_date,
        search_radius_km=search_radius
    )

    if not relevant_markets:
        # Check if nearby markets exist without crop data
        if nearby_markets:
            market_names = ", ".join(m["market_name"] for m in nearby_markets[:3])
            reason_msg = f"Nearby markets ({market_names}) do not have sufficient data for {payload.crop}."
        else:
            reason_msg = f"No agricultural markets were found within {search_radius} km of your location."
            
        return {
            "crop": payload.crop,
            "quantity": payload.quantity,
            "target_date": payload.target_date,
            "location": {
                "name": payload.location_name or "User Location",
                "latitude": payload.latitude,
                "longitude": payload.longitude
            },
            "markets": [],
            "best_market": {},
            "recommendation": {
                "type": "HOLD_AND_MONITOR",
                "reason": reason_msg
            },
            "disclaimer": "Price predictions are generated using a machine learning model trained on available historical agricultural market data. Actual market prices may vary due to market demand, supply, weather, arrivals, and other factors."
        }

    best_market, recommendation = evaluate_decision_recommendation(
        markets=relevant_markets,
        crop=payload.crop,
        quantity=payload.quantity,
        target_date=payload.target_date
    )

    # Extract top-level weather forecast for the recommended market
    top_weather = best_market.get("weather") if best_market else None
    if top_weather:
        top_weather["location"] = best_market.get("market_name", "Recommended Market")


    return {
        "crop": payload.crop,
        "quantity": payload.quantity,
        "target_date": payload.target_date,
        "location": {
            "name": payload.location_name or "Detected Location",
            "latitude": payload.latitude,
            "longitude": payload.longitude
        },
        "markets": relevant_markets,
        "best_market": best_market,
        "recommendation": recommendation,
        "weather": top_weather,
        "disclaimer": "Price predictions are generated using a machine learning model trained on available historical agricultural market data. Actual market prices may vary due to market demand, supply, weather, arrivals, and other factors."
    }

