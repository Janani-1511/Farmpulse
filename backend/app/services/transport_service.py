from app.utils.config import settings

def calculate_transport_cost(distance_km: float, rate_per_km: float = None) -> float:
    """
    Calculate estimated transportation cost based on distance in kilometers
    and rate per kilometer.
    Formula: Distance (km) * Transport Rate (₹/km)
    """
    if rate_per_km is None:
        rate_per_km = settings.TRANSPORT_RATE_PER_KM
    
    cost = distance_km * rate_per_km
    return round(cost, 2)
