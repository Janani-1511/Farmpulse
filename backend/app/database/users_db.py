import os
import hashlib
import secrets
import random
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from decimal import Decimal
import boto3
from boto3.dynamodb.conditions import Key, Attr
from app.utils.config import settings

def _clean_dynamodb_item(item: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    if not item:
        return None
    cleaned = {}
    for k, v in item.items():
        if isinstance(v, Decimal):
            if v % 1 == 0:
                cleaned[k] = int(v)
            else:
                cleaned[k] = float(v)
        else:
            cleaned[k] = v
    return cleaned

def get_dynamodb_resource():
    kwargs = {"region_name": settings.AWS_REGION}
    if getattr(settings, "AWS_ACCESS_KEY_ID", None) and getattr(settings, "AWS_SECRET_ACCESS_KEY", None):
        if settings.AWS_ACCESS_KEY_ID.strip() and settings.AWS_SECRET_ACCESS_KEY.strip():
            kwargs["aws_access_key_id"] = settings.AWS_ACCESS_KEY_ID.strip()
            kwargs["aws_secret_access_key"] = settings.AWS_SECRET_ACCESS_KEY.strip()
    return boto3.resource("dynamodb", **kwargs)

def get_users_table():
    table_name = getattr(settings, "DYNAMODB_USERS_TABLE", "FarmPulseUsers")
    return get_dynamodb_resource().Table(table_name)

def get_otp_table():
    table_name = getattr(settings, "DYNAMODB_OTP_TABLE", "FarmPulseOTPs")
    return get_dynamodb_resource().Table(table_name)

def init_users_db():
    """No-op for DynamoDB persistence (tables created out-of-band in AWS)."""
    pass

def hash_password(password: str, salt: Optional[str] = None) -> tuple[str, str]:
    """Hashes a password using PBKDF2-HMAC-SHA256 with a random salt."""
    if not salt:
        salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    )
    return key.hex(), salt

def generate_and_store_otp(email: str) -> str:
    """Generates a 6-digit OTP and stores it in DynamoDB for the given email."""
    clean_email = email.strip().lower()
    otp = f"{random.randint(100000, 999999)}"
    expires_at = (datetime.utcnow() + timedelta(minutes=10)).isoformat()

    table = get_otp_table()
    table.put_item(
        Item={
            "email": clean_email,
            "otp": otp,
            "expires_at": expires_at,
            "verified": 0
        }
    )
    return otp

def verify_otp_code(email: str, otp: str) -> bool:
    """Verifies if the submitted OTP matches and is not expired."""
    clean_email = email.strip().lower()
    clean_otp = otp.strip()

    table = get_otp_table()
    response = table.get_item(Key={"email": clean_email})
    raw_item = response.get("Item")

    if not raw_item:
        raise ValueError("No OTP request found for this email address. Please request a new OTP.")

    item = _clean_dynamodb_item(raw_item)
    expires_at = datetime.fromisoformat(item["expires_at"])

    if datetime.utcnow() > expires_at:
        raise ValueError("The OTP code has expired. Please request a new code.")

    if str(item["otp"]) != clean_otp:
        raise ValueError("Invalid OTP code. Please check and try again.")

    table.update_item(
        Key={"email": clean_email},
        UpdateExpression="SET verified = :v",
        ExpressionAttributeValues={":v": 1}
    )
    return True

def reset_password(email: str, new_password: str) -> bool:
    """Resets or sets user password by email address after OTP verification."""
    clean_email = email.strip().lower()

    otp_table = get_otp_table()
    response = otp_table.get_item(Key={"email": clean_email})
    raw_otp = response.get("Item")
    if not raw_otp or _clean_dynamodb_item(raw_otp).get("verified") != 1:
        raise ValueError("Email verification required. Please request and verify OTP first.")

    user = get_user_by_email(clean_email)
    pwd_hash, salt = hash_password(new_password)
    users_table = get_users_table()

    if user:
        users_table.update_item(
            Key={"email": clean_email},
            UpdateExpression="SET password_hash = :p, salt = :s",
            ExpressionAttributeValues={":p": pwd_hash, ":s": salt}
        )
    else:
        created_at = datetime.utcnow().isoformat()
        name_from_email = clean_email.split('@')[0].capitalize()
        user_id = int(datetime.utcnow().timestamp() * 1000)
        users_table.put_item(
            Item={
                "email": clean_email,
                "id": user_id,
                "full_name": name_from_email,
                "city": "Coimbatore",
                "password_hash": pwd_hash,
                "salt": salt,
                "created_at": created_at,
                "auth_provider": "password",
                "google_id": "",
                "profile_picture": ""
            }
        )

    otp_table.delete_item(Key={"email": clean_email})
    return True

def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Retrieves user by email address."""
    clean_email = email.strip().lower()
    table = get_users_table()
    response = table.get_item(Key={"email": clean_email})
    return _clean_dynamodb_item(response.get("Item"))

def get_user_by_id(user_id: int) -> Optional[Dict[str, Any]]:
    """Retrieves user by integer ID."""
    table = get_users_table()
    response = table.scan(
        FilterExpression=Attr("id").eq(user_id)
    )
    items = response.get("Items", [])
    if items:
        return _clean_dynamodb_item(items[0])
    return None

def create_user(full_name: str, email: str, city: str, password: str) -> Dict[str, Any]:
    """Creates a new user account if the email does not already exist."""
    clean_email = email.strip().lower()
    existing = get_user_by_email(clean_email)
    if existing:
        raise ValueError("An account with this email address already exists. Please sign in.")

    pwd_hash, salt = hash_password(password)
    created_at = datetime.utcnow().isoformat()
    user_id = int(datetime.utcnow().timestamp() * 1000)

    table = get_users_table()
    item = {
        "email": clean_email,
        "id": user_id,
        "full_name": full_name.strip(),
        "city": city.strip(),
        "password_hash": pwd_hash,
        "salt": salt,
        "created_at": created_at,
        "auth_provider": "password",
        "google_id": "",
        "profile_picture": ""
    }
    table.put_item(Item=item)

    return {
        "id": user_id,
        "full_name": full_name.strip(),
        "email": clean_email,
        "city": city.strip(),
        "created_at": created_at,
        "auth_provider": "password"
    }

def get_or_create_google_user(google_id: str, email: str, full_name: str, profile_picture: str = None) -> Dict[str, Any]:
    """Finds existing user by email/google_id, or creates a new one via Google Auth."""
    clean_email = email.strip().lower()
    user = get_user_by_email(clean_email)
    table = get_users_table()

    if user:
        if not user.get("google_id"):
            picture_val = profile_picture or user.get("profile_picture", "")
            table.update_item(
                Key={"email": clean_email},
                UpdateExpression="SET google_id = :gid, auth_provider = :ap, profile_picture = :pic",
                ExpressionAttributeValues={
                    ":gid": google_id,
                    ":ap": "google",
                    ":pic": picture_val or ""
                }
            )
            user["google_id"] = google_id
            user["auth_provider"] = "google"
            user["profile_picture"] = picture_val
        return user

    created_at = datetime.utcnow().isoformat()
    user_id = int(datetime.utcnow().timestamp() * 1000)
    item = {
        "email": clean_email,
        "id": user_id,
        "full_name": full_name.strip(),
        "city": "",
        "password_hash": "",
        "salt": "",
        "created_at": created_at,
        "auth_provider": "google",
        "google_id": google_id,
        "profile_picture": profile_picture or ""
    }
    table.put_item(Item=item)

    return {
        "id": user_id,
        "full_name": full_name.strip(),
        "email": clean_email,
        "city": "",
        "created_at": created_at,
        "auth_provider": "google",
        "google_id": google_id,
        "profile_picture": profile_picture
    }

def update_user_city(user_id: int, city: str) -> bool:
    user = get_user_by_id(user_id)
    if not user:
        return False
    table = get_users_table()
    table.update_item(
        Key={"email": user["email"]},
        UpdateExpression="SET city = :c",
        ExpressionAttributeValues={":c": city.strip()}
    )
    return True

def authenticate_user(email: str, password: str) -> Optional[Dict[str, Any]]:
    """Verifies email and password credentials securely."""
    clean_email = email.strip().lower()
    user = get_user_by_email(clean_email)
    if not user:
        return None
    if not user.get("password_hash") or not user.get("salt"):
        return None

    computed_hash, _ = hash_password(password, user["salt"])
    if secrets.compare_digest(computed_hash, user["password_hash"]):
        return {
            "id": user["id"],
            "full_name": user["full_name"],
            "email": user["email"],
            "city": user["city"],
            "created_at": user["created_at"],
            "auth_provider": user.get("auth_provider", "password"),
            "profile_picture": user.get("profile_picture")
        }
    return None
