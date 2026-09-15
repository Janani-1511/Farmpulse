from typing import List, Dict, Any, Tuple
from app.database.markets_db import get_all_markets
from app.services.distance_service import calculate_haversine_distance
from app.services.prediction_service import predict_crop_price
from app.services.transport_service import calculate_transport_cost
from app.services.revenue_service import calculate_revenue
from app.services.weather_service import get_market_weather_forecast

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
    3. Filter markets that support the selected crop and have real historical data.
    4. Fetch live weather forecast for target market coordinates and date.
    5. Calculate current price, ML predicted price, transport cost, expected gross revenue, and net revenue.
    6. Return tuple: (relevant_markets_sorted_by_net_revenue, all_nearby_markets)
    """
    all_markets = get_all_markets()
    nearby_markets = []
    relevant_markets = []

    for mkt in all_markets:
        dist_km = calculate_haversine_distance(user_lat, user_lon, mkt["latitude"], mkt["longitude"])
        
        if dist_km <= search_radius_km:
            has_crop_support = crop in mkt["supported_crops"]
            
            market_info = {
                "id": mkt["id"],
                "market_name": mkt["market_name"],
                "district": mkt["district"],
                "state": mkt["state"],
                "latitude": mkt["latitude"],
                "longitude": mkt["longitude"],
                "market_type": mkt["market_type"],
                "distance_km": dist_km,
                "has_crop_data": has_crop_support
            }
            
            nearby_markets.append(market_info)

            if has_crop_support:
                # Predict crop prices using real data & ML model
                prices = predict_crop_price(
                    crop=crop,
                    market_id=mkt["id"],
                    target_date_str=target_date,
                    price_modifier=mkt.get("price_modifier", 1.0)
                )
                
                # Skip markets with no real data fallback
                if prices.get("has_real_data") is False:
                    continue
                
                # Fetch live weather forecast for market location & date
                weather_info = get_market_weather_forecast(
                    latitude=mkt["latitude"],
                    longitude=mkt["longitude"],
                    target_date_str=target_date
                )

                # Transport cost
                transport = calculate_transport_cost(dist_km)
                
                # Revenue metrics
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
                    "distance_km": dist_km,
                    "distance_method": "Haversine Straight-Line Formula Estimate",
                    "current_price": prices["current_price"],
                    "predicted_price": prices["predicted_price"],
                    "transport_cost": transport,
                    "expected_revenue": revenue["expected_gross_revenue"],
                    "estimated_net_revenue": revenue["estimated_net_revenue"],
                    "weather": weather_info
                }
                
                relevant_markets.append(market_analysis)

    # Sort relevant markets by highest estimated net revenue descending by default
    relevant_markets.sort(key=lambda x: x["estimated_net_revenue"], reverse=True)
    nearby_markets.sort(key=lambda x: x["distance_km"])

    return relevant_markets, nearby_markets

