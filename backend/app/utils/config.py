import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    APP_NAME: str = "FarmPulse API"
    APP_VERSION: str = "1.0.0"
    APP_ENV: str = "development"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEFAULT_MARKET_RADIUS_KM: float = 100.0
    TRANSPORT_RATE_PER_KM: float = 25.0
    GOOGLE_CLIENT_ID: str = ""
    ROUTING_PROVIDER: str = "osrm"
    ROUTING_API_KEY: str = ""

    # AWS DynamoDB Configuration
    DYNAMODB_USERS_TABLE: str = "FarmPulseUsers"
    DYNAMODB_OTP_TABLE: str = "FarmPulseOTPs"

    # AWS S3 Model Storage Configuration
    AWS_S3_BUCKET: str = "farmpulse-ml-models"
    AWS_S3_MODEL_KEY: str = "price_model_compressed.pkl"
    AWS_REGION: str = "ap-south-1"
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()

