from typing import Dict, Any

def evaluate_weather_impact(
    weather_condition: str,
    precipitation_mm: float,
    rain_probability: float,
    wind_speed_kmh: float = 0.0,
    temp_max_c: float = 25.0
) -> Dict[str, Any]:
    """
    Evaluates weather risk level (Low, Medium, High) and generates careful impact assessments.
    """
    risk_level = "Low"
    impact_statement = "Favorable weather conditions expected. Minimal impact on transport and market operations."

    # High Risk Evaluation
    if (
        precipitation_mm >= 15.0
        or rain_probability >= 75.0
        or "Thunderstorm" in weather_condition
        or "Violent" in weather_condition
        or "Heavy Rain" in weather_condition
        or wind_speed_kmh >= 35.0
    ):
        risk_level = "High"
        impact_statement = "Severe weather conditions or heavy rainfall expected. Higher risk of transport delays and reduced market arrivals."

    # Medium Risk Evaluation
    elif (
        precipitation_mm >= 2.0
        or rain_probability >= 35.0
        or "Rain" in weather_condition
        or "Drizzle" in weather_condition
        or "Fog" in weather_condition
    ):
        risk_level = "Medium"
        impact_statement = "Moderate rainfall or weather conditions may affect transportation and market arrivals."

    return {
        "weather_risk": risk_level,
        "impact_assessment": impact_statement
    }
