from typing import List, Dict, Any, Tuple
from concurrent.futures import ThreadPoolExecutor
from app.database.markets_db import get_all_markets
from app.services.distance_service import calculate_haversine_distance, get_road_distance
from app.services.prediction_service import predict_crop_price
from app.services.transport_service import calculate_transport_cost
from app.services.revenue_service import calculate_revenue
from app.services.weather_service import get_market_weather_forecast

def _analyze_single_market(mkt: Dict[str, Any], user_lat: float, user_lon: float, crop: str, quantity: float, target_date: str) -> Tuple[Dict[str, Any], Dict[str, Any]]:
    has_crop_support = crop in mkt["supported_crops"]
    dist_res = get_road_distance(user_lat, user_lon, mkt["latitude"], mkt["longitude"])
    road_dist_km = dist_res["distance_km"]
    dist_type = dist_res["distance_type"]
    dist_method = dist_res["distance_method"]
    
    market_info = {
        "id": mkt["id"],
        "market_name": mkt["market_name"],
        "district": mkt["district"],
        "state": mkt["state"],
        "latitude": mkt["latitude"],
        "longitude": mkt["longitude"],
        "market_type": mkt["market_type"],
        "distance_km": road_dist_km,
        "distance_type": dist_type,
        "distance_method": dist_method,
        "has_crop_data": has_crop_support
    }

    market_analysis = None
    if has_crop_support:
        prices = predict_crop_price(
            crop=crop,
            market_id=mkt["id"],
            target_date_str=target_date,
            price_modifier=mkt.get("price_modifier", 1.0)
        )
        
        if prices.get("has_real_data") not in (False, None):
            weather_info = get_market_weather_forecast(
                latitude=mkt["latitude"],
                longitude=mkt["longitude"],
                target_date_str=target_date
            )

            transport = calculate_transport_cost(road_dist_km)
            revenue = calculate_revenue(
                predicted_price_per_quintal=prices["predicted_price"],
                quantity_quintals=quantity,
                transport_cost=transport
            )
            
            market_analysis = {
                "id": mkt["id"],
                "market_name": mkt["market_name"],
                "district": mkt["district"],
                "state": mkt["state"],
                "latitude": mkt["latitude"],
                "longitude": mkt["longitude"],
                "market_type": mkt["market_type"],
                "distance_km": road_dist_km,
                "distance_type": dist_type,
                "distance_method": dist_method,
                "current_price": prices["current_price"],
                "predicted_price": prices["predicted_price"],
                "model_status": prices.get("model_status"),
                "is_ml_model": prices.get("is_ml_model", False),
                "transport_cost": transport,
                "expected_revenue": revenue["expected_gross_revenue"],
                "estimated_net_revenue": revenue["estimated_net_revenue"],
                "weather": weather_info
            }

    return market_info, market_analysis

def get_nearby_markets_analysis(
    user_lat: float,
    user_lon: float,
    crop: str,
    quantity: float,
    target_date: str,
    search_radius_km: float = 100.0
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    1. Retrieve all regional markets.
    2. Filter markets within search_radius_km using Haversine formula.
    3. Concurrently compute road distance, price predictions, transport costs, and weather forecasts.
    4. Return sorted table data and recommendations.
    """
    all_markets = get_all_markets()
    candidate_markets = [
        mkt for mkt in all_markets
        if calculate_haversine_distance(user_lat, user_lon, mkt["latitude"], mkt["longitude"]) <= search_radius_km
    ]

    nearby_markets = []
    relevant_markets = []

    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [
            executor.submit(_analyze_single_market, mkt, user_lat, user_lon, crop, quantity, target_date)
            for mkt in candidate_markets
        ]
        for future in futures:
            try:
                info, analysis = future.result()
                if info:
                    nearby_markets.append(info)
                if analysis:
                    relevant_markets.append(analysis)
            except Exception as e:
                print(f"Error processing market: {e}")

    relevant_markets.sort(key=lambda x: x["estimated_net_revenue"], reverse=True)
    nearby_markets.sort(key=lambda x: x["distance_km"])

    return relevant_markets, nearby_markets

