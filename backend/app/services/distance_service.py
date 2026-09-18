import math
import logging
import requests
from typing import Dict, Any
from app.utils.config import settings

logger = logging.getLogger("farmpulse.distance")

# In-memory LRU distance cache
DISTANCE_CACHE: Dict[str, Dict[str, Any]] = {}
MAX_CACHE_SIZE = 200

def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the geographical straight-line distance between two points
    on Earth using the Haversine formula.
    Returns distance in kilometers (rounded to 1 decimal place).
    """
    R = 6371.0

    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)

    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad

    a = math.sin(dlat / 2.0)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2.0)**2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))

    distance = R * c
    return round(distance, 1)

def get_road_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> Dict[str, Any]:
    """
    Calculate actual road driving distance (in km) between two coordinates.
    Uses OSRM / configured routing provider API.
    If routing provider is offline or fails, falls back to Haversine distance explicitly marked as 'estimated'.
    Returns dictionary:
      {
        "distance_km": float,
        "distance_type": "road" | "estimated",
        "distance_method": str
      }
    """
    cache_key = f"{round(lat1, 4)},{round(lon1, 4)}->{round(lat2, 4)},{round(lon2, 4)}"
    if cache_key in DISTANCE_CACHE:
        return DISTANCE_CACHE[cache_key]

    haversine_dist = calculate_haversine_distance(lat1, lon1, lat2, lon2)

    # Intra-city minimum distance (if origin & destination coordinates are virtually identical)
    if haversine_dist < 0.1:
        res = {
            "distance_km": 2.5,
            "distance_type": "road",
            "distance_method": "Intra-City Road Minimum"
        }
        logger.info(f"Origin: {lat1}, {lon1} | Destination: {lat2}, {lon2} | Route distance: 2.5 km | Distance type: road")
        DISTANCE_CACHE[cache_key] = res
        return res

    provider = (getattr(settings, 'ROUTING_PROVIDER', 'osrm') or 'osrm').lower()

    # Attempt OSRM real road network routing
    if provider == 'osrm':
        try:
            url = f"http://router.project-osrm.org/route/v1/driving/{lon1},{lat1};{lon2},{lat2}?overview=false"
            resp = requests.get(url, timeout=1.5)
            if resp.status_code == 200:
                data = resp.json()
                if data.get("code") == "Ok" and data.get("routes"):
                    meters = data["routes"][0]["distance"]
                    road_dist = round(meters / 1000.0, 1)

                    res = {
                        "distance_km": road_dist,
                        "distance_type": "road",
                        "distance_method": "OSRM Road Driving Distance Routing"
                    }
                    logger.info(f"Origin: {lat1}, {lon1} | Destination: {lat2}, {lon2} | Route distance: {road_dist} km | Distance type: road")

                    if len(DISTANCE_CACHE) >= MAX_CACHE_SIZE:
                        first_key = next(iter(DISTANCE_CACHE))
                        del DISTANCE_CACHE[first_key]

                    DISTANCE_CACHE[cache_key] = res
                    return res
        except Exception as e:
            logger.warning(f"Routing API failed ({e}). Falling back to Haversine estimated distance.")

    # Fallback to Haversine straight-line distance explicitly marked as estimated
    est_dist = haversine_dist
    res = {
        "distance_km": est_dist,
        "distance_type": "estimated",
        "distance_method": "Haversine Straight-Line Distance Estimation"
    }
    logger.info(f"Origin: {lat1}, {lon1} | Destination: {lat2}, {lon2} | Route distance: {est_dist} km | Distance type: estimated")

    if len(DISTANCE_CACHE) >= MAX_CACHE_SIZE:
        first_key = next(iter(DISTANCE_CACHE))
        del DISTANCE_CACHE[first_key]

    DISTANCE_CACHE[cache_key] = res
    return res


