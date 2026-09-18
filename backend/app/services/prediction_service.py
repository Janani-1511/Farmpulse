import os
import joblib
import pandas as pd
from datetime import datetime
from typing import Dict, Any, Optional

from app.ml.feature_engineering import prepare_prediction_features

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "ml", "models")
MODEL_PATH = os.path.join(MODELS_DIR, "price_model.pkl")
PREPROCESSOR_PATH = os.path.join(MODELS_DIR, "preprocessor.pkl")
CSV_PATH = os.path.join(os.path.dirname(__file__), "..", "ml", "data", "agricultural_prices.csv")

_model = None
_preprocessor = None
_data_cache = None

def load_ml_models():
    """Loads saved Random Forest model and preprocessor on backend startup."""
    global _model, _preprocessor
    if os.path.exists(MODEL_PATH) and os.path.exists(PREPROCESSOR_PATH):
        try:
            _model = joblib.load(MODEL_PATH)
            _preprocessor = joblib.load(PREPROCESSOR_PATH)
            print("RandomForest price prediction model and preprocessor loaded successfully.")
        except Exception as e:
            print(f"Error loading ML model files: {e}")
    else:
        print("ML model files not found. Call train_model.py first.")

def get_real_market_latest_price(crop: str, market_id: str) -> Optional[float]:
    """Queries the latest real historical modal price for the given crop and market."""
    global _data_cache
    if not os.path.exists(CSV_PATH):
        return None
        
    if _data_cache is None:
        _data_cache = pd.read_csv(CSV_PATH)
        _data_cache['date'] = pd.to_datetime(_data_cache['date'])
        
    filtered = _data_cache[
        (_data_cache['crop'].str.lower() == crop.lower()) &
        (_data_cache['market_id'].str.lower() == market_id.lower())
    ]
    
    if len(filtered) == 0:
        return None
        
    latest_row = filtered.sort_values(by='date', ascending=False).iloc[0]
    return float(latest_row['modal_price'])

def predict_crop_price(
    crop: str,
    market_id: str,
    target_date_str: str,
    price_modifier: float = 1.0,
    base_modal_price: Optional[float] = None
) -> Dict[str, Any]:
    """
    Predicts modal price per quintal for the given crop, market, and target future date using trained ML model.
    If real historical data is unavailable for the crop & market, returns transparent failure notice.
    """
    global _model, _preprocessor
    if _model is None or _preprocessor is None:
        load_ml_models()
        
    try:
        target_dt = pd.to_datetime(target_date_str)
    except Exception:
        target_dt = pd.Timestamp.now()
        
    if base_modal_price is not None:
        current_modal_price = base_modal_price
    else:
        current_modal_price = get_real_market_latest_price(crop, market_id)
    
    if current_modal_price is None:
        return {
            "has_real_data": False,
            "message": f"Insufficient real historical data is available to generate a reliable prediction for {crop} in selected market ({market_id}).",
            "current_price": 0.0,
            "predicted_price": 0.0
        }

    current_price = round(current_modal_price, 2)
    
    if _model is not None and _preprocessor is not None:
        feat_dict = prepare_prediction_features(
            crop=crop,
            market_id=market_id,
            target_date=target_dt,
            base_modal_price=current_modal_price,
            price_modifier=1.0
        )
        
        feature_df = pd.DataFrame([{
            "crop": feat_dict["crop"],
            "market_id": feat_dict["market_id"],
            "day": feat_dict["day"],
            "month": feat_dict["month"],
            "year": feat_dict["year"],
            "dayofweek": feat_dict["dayofweek"],
            "dayofyear": feat_dict["dayofyear"],
            "lag_1": feat_dict["lag_1"],
            "lag_7": feat_dict["lag_7"],
            "lag_30": feat_dict["lag_30"],
            "rolling_mean_7": feat_dict["rolling_mean_7"],
            "rolling_mean_30": feat_dict["rolling_mean_30"]
        }])
        
        try:
            X_proc = _preprocessor.transform(feature_df)
            pred = _model.predict(X_proc)[0]
            predicted_price = round(float(pred), 2)
        except Exception:
            predicted_price = round(feat_dict["adjusted_price"], 2)
    else:
        # Strictly use feature adjustment based on real historical base price
        feat_dict = prepare_prediction_features(
            crop=crop,
            market_id=market_id,
            target_date=target_dt,
            base_modal_price=current_modal_price,
            price_modifier=1.0
        )
        predicted_price = round(feat_dict["adjusted_price"], 2)
        
    return {
        "has_real_data": True,
        "current_price": current_price,
        "predicted_price": predicted_price
    }

