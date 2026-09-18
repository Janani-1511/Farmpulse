import requests
from datetime import datetime, date
from typing import Dict, Any
from app.services.weather_impact_service import evaluate_weather_impact

# Weather code interpretations per WMO guidelines
WMO_WEATHER_CODES = {
    0: "Clear Sky",
    1: "Mainly Clear",
    2: "Partly Cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Depositing Rime Fog",
    51: "Light Drizzle",
    53: "Moderate Drizzle",
    55: "Dense Drizzle",
    61: "Slight Rain",
    63: "Moderate Rain",
    65: "Heavy Rain",
    71: "Slight Snow",
    80: "Slight Rain Showers",
    81: "Moderate Rain Showers",
    82: "Violent Rain Showers",
    95: "Thunderstorm"
}

WEATHER_CACHE: Dict[str, Dict[str, Any]] = {}

def get_market_weather_forecast(latitude: float, longitude: float, target_date_str: str) -> Dict[str, Any]:
    """
    Retrieves real weather forecast from Open-Meteo REST API for given lat/lon and target date.
    Open-Meteo provides up to 16 forecast days (days_ahead 0 to 15).
    """
    cache_key = f"{round(latitude, 2)},{round(longitude, 2)},{target_date_str}"
    if cache_key in WEATHER_CACHE:
        return WEATHER_CACHE[cache_key]

    try:
        target_dt = datetime.strptime(target_date_str, "%Y-%m-%d").date()
    except Exception:
        target_dt = date.today()

    today = date.today()
    days_ahead = (target_dt - today).days

    # If target date is past, fallback to today's date for current market weather conditions
    fetch_dt = target_dt
    if days_ahead < 0:
        fetch_dt = today

    # Open-Meteo supports up to 16 days forecast window (days_ahead 0 to 15)
    if days_ahead > 15:
        return {
            "available": False,
            "date": target_date_str,
            "days_ahead": days_ahead,
            "message": "Reliable weather forecast is not available for the selected selling date.",
            "reason": "Weather forecasts are available only within the supported 16-day forecast window. Price predictions and revenue analysis continue normally."
        }

    try:
        url = (
            f"https://api.open-meteo.com/v1/forecast?"
            f"latitude={latitude}&longitude={longitude}&"
            f"daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,weathercode&"
            f"timezone=auto&forecast_days=16"
        )
        response = requests.get(url, timeout=2)

        if response.status_code == 200:
            data = response.json()
            daily = data.get("daily", {})
            dates = daily.get("time", [])

            target_date_formatted = fetch_dt.strftime("%Y-%m-%d")

            # Fallback to nearest date in available forecast list if exact date boundary matches
            if target_date_formatted not in dates and len(dates) > 0:
                target_date_formatted = dates[-1]

            if target_date_formatted in dates:
                idx = dates.index(target_date_formatted)
                t_max = daily["temperature_2m_max"][idx] if "temperature_2m_max" in daily and daily["temperature_2m_max"][idx] is not None else 28.0
                t_min = daily["temperature_2m_min"][idx] if "temperature_2m_min" in daily and daily["temperature_2m_min"][idx] is not None else 20.0
                precip = daily["precipitation_sum"][idx] if "precipitation_sum" in daily and daily["precipitation_sum"][idx] is not None else 0.0

                rain_prob = 0.0
                if "precipitation_probability_max" in daily and daily["precipitation_probability_max"][idx] is not None:
                    rain_prob = float(daily["precipitation_probability_max"][idx])

                wind_speed = 10.0
                if "wind_speed_10m_max" in daily and daily["wind_speed_10m_max"][idx] is not None:
                    wind_speed = float(daily["wind_speed_10m_max"][idx])

                humidity = int(max(45, min(95, 80 - (t_max - t_min) * 2 + precip * 3)))

                w_code = daily["weathercode"][idx] if "weathercode" in daily and daily["weathercode"][idx] is not None else 0
                w_desc = WMO_WEATHER_CODES.get(w_code, "Partly Cloudy")

                # Evaluate Weather Risk & Impact Assessment
                impact_data = evaluate_weather_impact(
                    weather_condition=w_desc,
                    precipitation_mm=precip,
                    rain_probability=rain_prob,
                    wind_speed_kmh=wind_speed,
                    temp_max_c=t_max
                )

                res = {
                    "available": True,
                    "date": target_date_str,
                    "days_ahead": days_ahead,
                    "temperature_c": t_max,
                    "temperature_min_c": t_min,
                    "weather_condition": w_desc,
                    "rain_probability": rain_prob,
                    "rainfall_mm": precip,
                    "humidity": humidity,
                    "wind_speed": wind_speed,
                    "weather_risk": impact_data["weather_risk"],
                    "impact_assessment": impact_data["impact_assessment"]
                }
                WEATHER_CACHE[cache_key] = res
                return res
    except Exception as e:
        print(f"Weather API fetch warning: {e}")

    return {
        "available": False,
        "date": target_date_str,
        "days_ahead": days_ahead,
        "message": "Reliable weather forecast is not available for the selected date.",
        "reason": "Live weather forecast service is temporarily unreachable."
    }

