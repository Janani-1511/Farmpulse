import os
import pandas as pd
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Query

router = APIRouter()

CSV_PATH = os.path.join(os.path.dirname(__file__), "../../ml/data/agricultural_prices.csv")

@router.get("/history")
def get_price_history(
    crop: Optional[str] = Query(None, description="Filter by crop name (e.g. Tomato)"),
    market_id: Optional[str] = Query(None, description="Filter by market ID (e.g. mkt_coimbatore)"),
    days: Optional[int] = Query(30, description="Number of past days to retrieve (7, 30, 90, 365)"),
    limit: Optional[int] = Query(100, description="Maximum number of historical records")
):
    """
    Retrieves historical price records and summary statistics for crops across all agricultural markets.
    """
    if not os.path.exists(CSV_PATH):
        return {
            "records": [],
            "summary": {
                "avg_modal_price": 0,
                "max_price": 0,
                "min_price": 0,
                "total_arrivals": 0
            }
        }

    df = pd.read_csv(CSV_PATH)
    df['date'] = pd.to_datetime(df['date'])

    # Date filter
    max_date = df['date'].max()
    min_date = max_date - pd.Timedelta(days=days or 30)
    df_filtered = df[(df['date'] >= min_date) & (df['date'] <= max_date)]

    # Crop filter
    if crop and crop.lower() != "all":
        df_filtered = df_filtered[df_filtered['crop'].str.lower() == crop.lower()]

    # Market filter
    if market_id and market_id.lower() != "all":
        df_filtered = df_filtered[df_filtered['market_id'].str.lower() == market_id.lower()]

    df_filtered = df_filtered.sort_values(by="date", ascending=False)

    total_records = len(df_filtered)
    
    if total_records == 0:
        return {
            "records": [],
            "total_count": 0,
            "summary": {
                "avg_modal_price": 0,
                "max_price": 0,
                "min_price": 0,
                "total_arrivals": 0
            }
        }

    avg_modal = round(float(df_filtered['modal_price'].mean()), 2)
    max_p = round(float(df_filtered['max_price'].max()), 2)
    min_p = round(float(df_filtered['min_price'].min()), 2)
    total_arr = round(float(df_filtered['arrival_quantity'].sum()), 1)

    records_slice = df_filtered.head(limit or 100)
    records_list = []
    
    for _, row in records_slice.iterrows():
        records_list.append({
            "date": row['date'].strftime("%Y-%m-%d"),
            "crop": row['crop'],
            "market_id": row['market_id'],
            "market_name": row['market_name'],
            "min_price": float(row['min_price']),
            "max_price": float(row['max_price']),
            "modal_price": float(row['modal_price']),
            "arrival_quantity": float(row['arrival_quantity'])
        })

    return {
        "records": records_list,
        "total_count": total_records,
        "summary": {
            "avg_modal_price": avg_modal,
            "max_price": max_p,
            "min_price": min_p,
            "total_arrivals": total_arr
        }
    }


@router.get("/price-trend")
def get_price_trend(
    crop: str = Query("Tomato", description="Crop name"),
    market_id: str = Query("mkt_coimbatore", description="Market ID"),
    historical_days: int = Query(30, description="Historical period in days (7, 30, 90, 180, 365, -1)"),
    future_days: int = Query(15, description="Future prediction period in days (7, 15, 30)")
):
    """
    Returns real historical price trend + ML predicted future prices for interactive charts.
    """
    from app.services.price_trend_service import get_price_trend_analysis
    return get_price_trend_analysis(
        crop=crop,
        market_id=market_id,
        historical_days=historical_days,
        future_days=future_days
    )

