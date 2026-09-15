import os
import sys
import json
import numpy as np
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, root_mean_squared_error, r2_score
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer

# Ensure backend root is on python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from app.ml.feature_engineering import create_features

DATA_DIR = os.path.dirname(__file__)
MODELS_DIR = os.path.join(DATA_DIR, "models")
CSV_PATH = os.path.join(DATA_DIR, "data", "agricultural_prices.csv")
METRICS_PATH = os.path.join(MODELS_DIR, "model_metrics.json")

def load_and_clean_real_dataset() -> pd.DataFrame:
    """Loads, cleans, and validates real historical agricultural price data."""
    if not os.path.exists(CSV_PATH):
        raise FileNotFoundError(f"Real agricultural market dataset not found at {CSV_PATH}")

    print(f"Loading real historical market dataset from {CSV_PATH}...")
    df = pd.read_csv(CSV_PATH)
    initial_count = len(df)

    # 1. Clean column names & drop duplicates
    df.columns = df.columns.str.strip().str.lower()
    df = df.drop_duplicates(subset=["date", "crop", "market_id"])

    # 2. Convert and validate dates
    df['date'] = pd.to_datetime(df['date'], errors='coerce')
    df = df.dropna(subset=['date'])

    # 3. Numeric validation (modal_price, min_price, max_price, arrival_quantity)
    numeric_cols = ["modal_price", "min_price", "max_price", "arrival_quantity"]
    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')

    # Remove non-positive modal prices or invalid records
    df = df[df['modal_price'] > 0]
    df = df.dropna(subset=['crop', 'market_id', 'modal_price'])

    cleaned_count = len(df)
    print(f"Dataset Cleaning complete: Retained {cleaned_count} / {initial_count} valid records.")
    return df

def train_and_evaluate_models():
    """Trains ML models on real historical data and computes MAE, RMSE, R² scores."""
    os.makedirs(MODELS_DIR, exist_ok=True)
    
    df = load_and_clean_real_dataset()
    
    print("Engineering features for time-series model...")
    df = create_features(df)
    
    # Sort chronologically by date for realistic time-series validation
    df = df.sort_values(by="date").reset_index(drop=True)
    split_idx = int(len(df) * 0.8)
    
    feature_cols = [
        "crop", "market_id", "day", "month", "year",
        "dayofweek", "dayofyear", "lag_1", "lag_7", "lag_30",
        "rolling_mean_7", "rolling_mean_30"
    ]
    target_col = "modal_price"
    
    X_train = df.iloc[:split_idx][feature_cols]
    y_train = df.iloc[:split_idx][target_col]
    X_test = df.iloc[split_idx:][feature_cols]
    y_test = df.iloc[split_idx:][target_col]
    
    print(f"Time-based Split: Train records ({len(X_train)}), Test records ({len(X_test)})")
    
    categorical_cols = ["crop", "market_id"]
    numeric_cols = [c for c in feature_cols if c not in categorical_cols]
    
    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical_cols),
            ("num", "passthrough", numeric_cols)
        ]
    )
    
    X_train_proc = preprocessor.fit_transform(X_train)
    X_test_proc = preprocessor.transform(X_test)
    
    # 1. Baseline Model: Linear Regression
    lr_model = LinearRegression()
    lr_model.fit(X_train_proc, y_train)
    lr_preds = lr_model.predict(X_test_proc)
    
    lr_mae = float(mean_absolute_error(y_test, lr_preds))
    lr_rmse = float(root_mean_squared_error(y_test, lr_preds))
    lr_r2 = float(r2_score(y_test, lr_preds))
    
    print("\n--- Baseline Model (Linear Regression) Metrics ---")
    print(f"MAE : {lr_mae:.2f}")
    print(f"RMSE: {lr_rmse:.2f}")
    print(f"R²  : {lr_r2:.4f}")
    
    # 2. Primary Model: Random Forest Regressor
    rf_model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
    rf_model.fit(X_train_proc, y_train)
    rf_preds = rf_model.predict(X_test_proc)
    
    rf_mae = float(mean_absolute_error(y_test, rf_preds))
    rf_rmse = float(root_mean_squared_error(y_test, rf_preds))
    rf_r2 = float(r2_score(y_test, rf_preds))
    
    print("\n--- Primary Model (Random Forest Regressor) Metrics ---")
    print(f"MAE : {rf_mae:.2f}")
    print(f"RMSE: {rf_rmse:.2f}")
    print(f"R²  : {rf_r2:.4f}")
    
    # Save primary model & preprocessor
    model_path = os.path.join(MODELS_DIR, "price_model.pkl")
    prep_path = os.path.join(MODELS_DIR, "preprocessor.pkl")
    
    joblib.dump(rf_model, model_path)
    joblib.dump(preprocessor, prep_path)
    
    metrics_summary = {
        "model_name": "RandomForestRegressor",
        "trained_at": pd.Timestamp.now().strftime("%Y-%m-%d %H:%M:%S"),
        "total_records": len(df),
        "train_records": len(X_train),
        "test_records": len(X_test),
        "primary_model_metrics": {
            "MAE": round(rf_mae, 2),
            "RMSE": round(rf_rmse, 2),
            "R2_Score": round(rf_r2, 4)
        },
        "baseline_model_metrics": {
            "MAE": round(lr_mae, 2),
            "RMSE": round(lr_rmse, 2),
            "R2_Score": round(lr_r2, 4)
        }
    }
    
    with open(METRICS_PATH, "w") as f:
        json.dump(metrics_summary, f, indent=2)
        
    print(f"\nModel artifacts & metrics successfully saved to {MODELS_DIR}")
    return metrics_summary

if __name__ == "__main__":
    train_and_evaluate_models()

