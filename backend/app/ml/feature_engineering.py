import pandas as pd
import numpy as np
from typing import Tuple, List, Dict, Any

def create_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Extract calendar, temporal, lag, and rolling features for time-series market price model.
    """
    df = df.copy()
    
    # Convert date if needed
    if not pd.api.types.is_datetime64_any_dtype(df['date']):
        df['date'] = pd.to_datetime(df['date'])
        
    df = df.sort_values(by=['crop', 'market_id', 'date']).reset_index(drop=True)
    
    # Calendar features
    df['day'] = df['date'].dt.day
    df['month'] = df['date'].dt.month
    df['year'] = df['date'].dt.year
    df['dayofweek'] = df['date'].dt.dayofweek
    df['dayofyear'] = df['date'].dt.dayofyear
    
    # Grouped lag & rolling features per crop and market
    grouped = df.groupby(['crop', 'market_id'])['modal_price']
    
    df['lag_1'] = grouped.shift(1)
    df['lag_7'] = grouped.shift(7)
    df['lag_30'] = grouped.shift(30)
    
    df['rolling_mean_7'] = grouped.transform(lambda x: x.shift(1).rolling(7, min_periods=1).mean())
    df['rolling_mean_30'] = grouped.transform(lambda x: x.shift(1).rolling(30, min_periods=1).mean())
    
    # Fill initial NaNs in lag features using backward fill or mean fallback
    for col in ['lag_1', 'lag_7', 'lag_30', 'rolling_mean_7', 'rolling_mean_30']:
        df[col] = df[col].bfill().fillna(df['modal_price'])
        
    return df

def prepare_prediction_features(
    crop: str,
    market_id: str,
    target_date: pd.Timestamp,
    base_modal_price: float,
    price_modifier: float = 1.0
) -> Dict[str, Any]:
    """
    Construct a single feature dictionary for predicting target date price.
    """
    day = target_date.day
    month = target_date.month
    year = target_date.year
    dayofweek = target_date.dayofweek
    dayofyear = target_date.dayofyear
    
    # Seasonal price trend adjustment factor based on month and crop
    seasonal_factors = {
        "Tomato": {1: 0.9, 2: 0.85, 3: 0.95, 4: 1.05, 5: 1.15, 6: 1.25, 7: 1.20, 8: 1.10, 9: 1.15, 10: 1.05, 11: 0.95, 12: 0.90},
        "Potato": {1: 0.95, 2: 0.90, 3: 0.92, 4: 0.98, 5: 1.02, 6: 1.05, 7: 1.10, 8: 1.08, 9: 1.04, 10: 1.00, 11: 0.96, 12: 0.94},
        "Onion": {1: 0.92, 2: 0.88, 3: 0.90, 4: 0.95, 5: 1.00, 6: 1.12, 7: 1.22, 8: 1.28, 9: 1.30, 10: 1.25, 11: 1.10, 12: 1.00},
        "Chilly": {1: 1.00, 2: 1.02, 3: 1.05, 4: 1.08, 5: 1.10, 6: 1.05, 7: 1.02, 8: 1.00, 9: 0.98, 10: 0.97, 11: 0.98, 12: 0.99},
        "Rice": {1: 1.00, 2: 0.98, 3: 0.99, 4: 1.01, 5: 1.02, 6: 1.03, 7: 1.04, 8: 1.03, 9: 1.02, 10: 1.01, 11: 0.99, 12: 0.98},
        "Wheat": {1: 1.02, 2: 1.04, 3: 0.96, 4: 0.92, 5: 0.94, 6: 0.98, 7: 1.00, 8: 1.01, 9: 1.02, 10: 1.03, 11: 1.04, 12: 1.03},
        "Maize": {1: 0.98, 2: 0.96, 3: 0.97, 4: 0.99, 5: 1.01, 6: 1.02, 7: 1.04, 8: 1.05, 9: 1.02, 10: 0.99, 11: 0.97, 12: 0.96},
        "Cotton": {1: 1.01, 2: 1.02, 3: 1.03, 4: 1.02, 5: 1.00, 6: 0.98, 7: 0.97, 8: 0.98, 9: 1.00, 10: 1.02, 11: 1.03, 12: 1.02},
    }
    
    crop_factor = seasonal_factors.get(crop, {}).get(month, 1.0)
    adjusted_price = base_modal_price * price_modifier * crop_factor
    
    return {
        "crop": crop,
        "market_id": market_id,
        "day": day,
        "month": month,
        "year": year,
        "dayofweek": dayofweek,
        "dayofyear": dayofyear,
        "lag_1": adjusted_price * 0.99,
        "lag_7": adjusted_price * 0.97,
        "lag_30": adjusted_price * 0.95,
        "rolling_mean_7": adjusted_price * 0.98,
        "rolling_mean_30": adjusted_price * 0.96,
        "adjusted_price": adjusted_price
    }
