import os
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from app.services.prediction_service import predict_crop_price, get_real_market_latest_price

CSV_PATH = os.path.join(os.path.dirname(__file__), "..", "ml", "data", "agricultural_prices.csv")

_df_cache = None

def get_data_frame():
    global _df_cache
    if _df_cache is None and os.path.exists(CSV_PATH):
        _df_cache = pd.read_csv(CSV_PATH)
        _df_cache['date'] = pd.to_datetime(_df_cache['date'])
    return _df_cache

def get_price_trend_analysis(
    crop: str,
    market_id: str,
    historical_days: int = 30,
    future_days: int = 15
) -> Dict[str, Any]:
    """
    Generates a combined historical + ML future price trend analysis for a crop and market.
    """
    df = get_data_frame()

    if df is None or len(df) == 0:
        return {
            "has_data": False,
            "message": "Agricultural market dataset is currently unavailable.",
            "crop": crop,
            "market_id": market_id
        }

    # Filter crop and market
    filtered = df[
        (df['crop'].str.lower() == crop.lower()) &
        (df['market_id'].str.lower() == market_id.lower())
    ].copy()

    if len(filtered) == 0:
        return {
            "has_data": False,
            "message": f"Insufficient historical market data is available to generate a reliable trend analysis for {crop} in selected market ({market_id}).",
            "crop": crop,
            "market_id": market_id
        }

    # Clean duplicates & sort chronologically
    filtered = filtered.drop_duplicates(subset=['date']).sort_values(by='date', ascending=True)

    max_date = filtered['date'].max()

    # Apply historical days filter if > 0 (-1 means all data)
    if historical_days > 0:
        min_date = max_date - pd.Timedelta(days=historical_days)
        hist_df = filtered[filtered['date'] >= min_date].copy()
        if len(hist_df) == 0:
            hist_df = filtered.tail(min(30, len(filtered))).copy()
    else:
        hist_df = filtered.copy()

    market_name = hist_df.iloc[-1]['market_name'] if 'market_name' in hist_df.columns else market_id

    # Format Historical Points
    historical_points = []
    for _, row in hist_df.iterrows():
        dt_str = row['date'].strftime("%Y-%m-%d")
        modal_q = round(float(row['modal_price']), 2)
        min_q = round(float(row['min_price']), 2) if 'min_price' in row and pd.notnull(row['min_price']) else modal_q
        max_q = round(float(row['max_price']), 2) if 'max_price' in row and pd.notnull(row['max_price']) else modal_q
        
        historical_points.append({
            "date": dt_str,
            "price_quintal": modal_q,
            "price_kg": round(modal_q / 100.0, 2),
            "min_price_quintal": min_q,
            "max_price_quintal": max_q,
            "min_price_kg": round(min_q / 100.0, 2),
            "max_price_kg": round(max_q / 100.0, 2),
            "arrival_quantity": round(float(row['arrival_quantity']), 1) if 'arrival_quantity' in row and pd.notnull(row['arrival_quantity']) else 0.0,
            "data_type": "Historical Market Data",
            "label": "Historical Modal Price"
        })

    latest_hist = historical_points[-1]
    latest_date_dt = max_date

    # Generate ML Predictions for future days
    predicted_points = []
    num_future = max(1, min(60, future_days))

    for i in range(1, num_future + 1):
        future_dt = latest_date_dt + pd.Timedelta(days=i)
        future_date_str = future_dt.strftime("%Y-%m-%d")
        
        pred_res = predict_crop_price(
            crop=crop,
            market_id=market_id,
            target_date_str=future_date_str
        )
        
        pred_q = round(float(pred_res.get("predicted_price", latest_hist["price_quintal"])), 2)
        pred_kg = round(pred_q / 100.0, 2)
        
        predicted_points.append({
            "date": future_date_str,
            "price_quintal": pred_q,
            "price_kg": pred_kg,
            "data_type": "ML Prediction",
            "label": "ML Predicted Price"
        })

    # Summary Statistics Calculation
    oldest_hist = historical_points[0]
    first_p_kg = oldest_hist["price_kg"]
    latest_p_kg = latest_hist["price_kg"]
    
    first_p_q = oldest_hist["price_quintal"]
    latest_p_q = latest_hist["price_quintal"]

    pct_change = round(((latest_p_kg - first_p_kg) / first_p_kg) * 100.0, 2) if first_p_kg > 0 else 0.0

    if pct_change > 2.0:
        trend_direction = "UPWARD"
        trend_label = "📈 UPWARD TREND"
        trend_message = f"{crop} prices in {market_name} have increased by approximately {abs(pct_change)}% over the selected historical period."
    elif pct_change < -2.0:
        trend_direction = "DOWNWARD"
        trend_label = "📉 DOWNWARD TREND"
        trend_message = f"{crop} prices in {market_name} have shown a decreasing trend of approximately {abs(pct_change)}% over the selected historical period."
    else:
        trend_direction = "STABLE"
        trend_label = "➡️ STABLE TREND"
        trend_message = f"{crop} prices in {market_name} have remained relatively stable with minor fluctuations ({pct_change:+g}% change)."

    hist_kg_prices = [p["price_kg"] for p in historical_points]
    hist_q_prices = [p["price_quintal"] for p in historical_points]

    highest_kg = max(hist_kg_prices)
    lowest_kg = min(hist_kg_prices)
    avg_kg = round(sum(hist_kg_prices) / len(hist_kg_prices), 2)

    highest_q = max(hist_q_prices)
    lowest_q = min(hist_q_prices)
    avg_q = round(sum(hist_q_prices) / len(hist_q_prices), 2)

    pred_7d_pt = predicted_points[min(6, len(predicted_points) - 1)]
    pred_30d_pt = predicted_points[min(29, len(predicted_points) - 1)]

    # Expected Future Direction comparing latest price to end of future prediction
    end_future_kg = predicted_points[-1]["price_kg"]
    future_pct_change = round(((end_future_kg - latest_p_kg) / latest_p_kg) * 100.0, 2) if latest_p_kg > 0 else 0.0
    
    if future_pct_change > 2.0:
        expected_future_trend = "📈 Increasing"
    elif future_pct_change < -2.0:
        expected_future_trend = "📉 Decreasing"
    else:
        expected_future_trend = "➡️ Stable"

    return {
        "has_data": True,
        "crop": crop,
        "market_id": market_id,
        "market_name": market_name,
        "historical_period_days": historical_days,
        "future_period_days": future_days,
        "latest_available_price": {
            "date": latest_hist["date"],
            "price_kg": latest_p_kg,
            "price_quintal": latest_p_q,
            "label": "Latest Available Market Price"
        },
        "historical_points": historical_points,
        "predicted_points": predicted_points,
        "summary": {
            "trend_direction": trend_direction,
            "trend_label": trend_label,
            "trend_message": trend_message,
            "percentage_change": pct_change,
            "highest_price_kg": highest_kg,
            "lowest_price_kg": lowest_kg,
            "avg_historical_price_kg": avg_kg,
            "highest_price_quintal": highest_q,
            "lowest_price_quintal": lowest_q,
            "avg_historical_price_quintal": avg_q,
            "latest_price_kg": latest_p_kg,
            "latest_price_quintal": latest_p_q,
            "pred_7d_kg": pred_7d_pt["price_kg"],
            "pred_7d_quintal": pred_7d_pt["price_quintal"],
            "pred_30d_kg": pred_30d_pt["price_kg"],
            "pred_30d_quintal": pred_30d_pt["price_quintal"],
            "expected_future_trend": expected_future_trend,
            "future_pct_change": future_pct_change
        },
        "transparency": {
            "data_source": "Agmarknet Agricultural Market Repository",
            "historical_start_date": historical_points[0]["date"],
            "historical_end_date": latest_hist["date"],
            "latest_available_date": latest_hist["date"],
            "prediction_period": f"Next {future_days} Days",
            "prediction_model": "RandomForestRegressor (Trained on Agmarknet)",
            "supported_units": ["₹/kg", "₹/quintal"]
        }
    }
