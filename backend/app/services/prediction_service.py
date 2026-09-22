import os
import joblib
import pandas as pd
from datetime import datetime
from typing import Dict, Any, Optional

import boto3
from botocore.exceptions import BotoCoreError, ClientError

from app.ml.feature_engineering import prepare_prediction_features
from app.utils.config import settings

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "ml", "models")
COMPRESSED_MODEL_PATH = os.path.join(MODELS_DIR, "price_model_compressed.pkl")
MODEL_PATH = os.path.join(MODELS_DIR, "price_model.pkl")
PREPROCESSOR_PATH = os.path.join(MODELS_DIR, "preprocessor.pkl")
CSV_PATH = os.path.join(os.path.dirname(__file__), "..", "ml", "data", "agricultural_prices.csv")
LOCAL_TMP_MODEL_PATH = "/tmp/price_model_compressed.pkl"

_model = None
_preprocessor = None
_data_cache = None
_model_status = "MODEL UNAVAILABLE"

def download_model_from_s3(target_path: str = LOCAL_TMP_MODEL_PATH) -> bool:
    """
    Downloads private S3 model object to local temp path using boto3 managed download.
    Handles missing credentials, AccessDenied, NoSuchKey, and network errors safely without printing secrets.
    """
    bucket = settings.AWS_S3_BUCKET
    key = settings.AWS_S3_MODEL_KEY
    region = settings.AWS_REGION
    access_key = settings.AWS_ACCESS_KEY_ID
    secret_key = settings.AWS_SECRET_ACCESS_KEY

    if not bucket or not key:
        print("[MODEL UNAVAILABLE] S3 bucket or model key is not configured.")
        return False

    if not access_key or not secret_key:
        print("[MODEL UNAVAILABLE] AWS credentials (AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY) are missing.")
        return False

    try:
        os.makedirs(os.path.dirname(target_path), exist_ok=True)
        s3_client = boto3.client(
            "s3",
            region_name=region if region else None,
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key
        )
        print(f"Downloading ML model from S3 bucket '{bucket}', key '{key}' to '{target_path}'...")
        s3_client.download_file(bucket, key, target_path)
        if os.path.exists(target_path) and os.path.getsize(target_path) > 0:
            print(f"Successfully downloaded ML model from S3 to {target_path} ({os.path.getsize(target_path)} bytes).")
            return True
        else:
            print(f"[MODEL UNAVAILABLE] S3 download finished but target file '{target_path}' is missing or empty.")
            return False
    except ClientError as e:
        error_code = str(e.response.get("Error", {}).get("Code", "Unknown"))
        if error_code in ("404", "NoSuchKey"):
            print(f"[MODEL UNAVAILABLE] S3 NoSuchKey: Object '{key}' in bucket '{bucket}' was not found.")
        elif error_code in ("403", "AccessDenied"):
            print(f"[MODEL UNAVAILABLE] S3 AccessDenied: Bucket '{bucket}', Key '{key}'. Check AWS IAM permissions.")
        else:
            msg = e.response.get("Error", {}).get("Message", "S3 client error")
            print(f"[MODEL UNAVAILABLE] S3 ClientError ({error_code}): {msg}")
        return False
    except BotoCoreError as e:
        print(f"[MODEL UNAVAILABLE] S3 BotoCore error: {e}")
        return False
    except Exception as e:
        print(f"[MODEL UNAVAILABLE] Error downloading model from S3: {e}")
        return False

def load_ml_models():
    """
    Loads saved Random Forest model and preprocessor on backend startup or on demand.
    1. Check if model is already loaded in module memory.
    2. Check /tmp/price_model_compressed.pkl.
    3. Download from private S3 if missing.
    4. Load model with joblib.load().
    5. Cache loaded model in _model.
    6. Package preprocessor.pkl retention.
    7. Set _model_status = "REAL TRAINED MODEL LOADED" only after successful model load.
    8. Set _model_status = "MODEL UNAVAILABLE" on failure.
    """
    global _model, _preprocessor, _model_status

    # 1. Module memory check
    if _model is not None and _preprocessor is not None:
        return

    model_to_load = None

    # 2. Check /tmp/price_model_compressed.pkl
    if os.path.exists(LOCAL_TMP_MODEL_PATH) and os.path.getsize(LOCAL_TMP_MODEL_PATH) > 0:
        model_to_load = LOCAL_TMP_MODEL_PATH
    else:
        # 3. Attempt S3 download to /tmp/price_model_compressed.pkl
        s3_success = download_model_from_s3(LOCAL_TMP_MODEL_PATH)
        if s3_success and os.path.exists(LOCAL_TMP_MODEL_PATH) and os.path.getsize(LOCAL_TMP_MODEL_PATH) > 0:
            model_to_load = LOCAL_TMP_MODEL_PATH

    # Fallback to local dev models directory if S3 download is not configured/fails but model exists locally
    if not model_to_load:
        if os.path.exists(COMPRESSED_MODEL_PATH) and os.path.getsize(COMPRESSED_MODEL_PATH) > 0:
            model_to_load = COMPRESSED_MODEL_PATH
        elif os.path.exists(MODEL_PATH) and os.path.getsize(MODEL_PATH) > 0:
            model_to_load = MODEL_PATH

    # Load model and preprocessor
    if model_to_load and os.path.exists(model_to_load) and os.path.exists(PREPROCESSOR_PATH):
        try:
            loaded_model = joblib.load(model_to_load)
            loaded_preprocessor = joblib.load(PREPROCESSOR_PATH)
            _model = loaded_model
            _preprocessor = loaded_preprocessor
            _model_status = "REAL TRAINED MODEL LOADED"
            print(f"[{_model_status}] Random Forest price prediction model ({os.path.basename(model_to_load)}) loaded successfully.")
        except Exception as e:
            _model = None
            _preprocessor = None
            _model_status = "MODEL UNAVAILABLE"
            print(f"[MODEL UNAVAILABLE] Exception loading ML model file '{model_to_load}': {e}")
    else:
        _model = None
        _preprocessor = None
        _model_status = "MODEL UNAVAILABLE"
        print(f"[{_model_status}] ML model file not found or preprocessor.pkl missing.")

def get_model_status() -> str:
    global _model_status
    return _model_status

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
    is_ml_used = False

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
            is_ml_used = True
        except Exception as e:
            print(f"Error executing ML model prediction: {e}")
            predicted_price = round(feat_dict["adjusted_price"], 2)
            is_ml_used = False
    else:
        feat_dict = prepare_prediction_features(
            crop=crop,
            market_id=market_id,
            target_date=target_dt,
            base_modal_price=current_modal_price,
            price_modifier=1.0
        )
        predicted_price = round(feat_dict["adjusted_price"], 2)
        is_ml_used = False
        
    return {
        "has_real_data": True,
        "current_price": current_price,
        "predicted_price": predicted_price,
        "model_status": get_model_status(),
        "is_ml_model": is_ml_used
    }
