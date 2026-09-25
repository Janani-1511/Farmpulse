import pytest
from unittest.mock import MagicMock, patch
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

class MockDynamoDBTable:
    def __init__(self, key_schema="email"):
        self.key_schema = key_schema
        self.items = {}

    def get_item(self, Key):
        val = Key.get(self.key_schema)
        item = self.items.get(val)
        if item:
            return {"Item": dict(item)}
        return {}

    def put_item(self, Item):
        val = Item.get(self.key_schema)
        self.items[val] = dict(Item)
        return {}

    def update_item(self, Key, UpdateExpression, ExpressionAttributeValues):
        val = Key.get(self.key_schema)
        item = self.items.get(val, {})
        # Simple update expression parsing for tests
        if "SET verified = :v" in UpdateExpression:
            item["verified"] = ExpressionAttributeValues[":v"]
        if "SET password_hash = :p, salt = :s" in UpdateExpression:
            item["password_hash"] = ExpressionAttributeValues[":p"]
            item["salt"] = ExpressionAttributeValues[":s"]
        if "SET google_id = :gid, auth_provider = :ap, profile_picture = :pic" in UpdateExpression:
            item["google_id"] = ExpressionAttributeValues[":gid"]
            item["auth_provider"] = ExpressionAttributeValues[":ap"]
            item["profile_picture"] = ExpressionAttributeValues[":pic"]
        if "SET city = :c" in UpdateExpression:
            item["city"] = ExpressionAttributeValues[":c"]
        self.items[val] = item
        return {}

    def delete_item(self, Key):
        val = Key.get(self.key_schema)
        self.items.pop(val, None)
        return {}

    def scan(self, FilterExpression=None):
        # Scan mock for id matching
        return {"Items": [dict(v) for v in self.items.values()]}

@pytest.fixture(autouse=True)
def mock_dynamodb_tables():
    mock_users = MockDynamoDBTable("email")
    mock_otps = MockDynamoDBTable("email")

    with patch("app.database.users_db.get_users_table", return_value=mock_users), \
         patch("app.database.users_db.get_otp_table", return_value=mock_otps):
        yield mock_users, mock_otps

def test_register_send_otp_success():
    res = client.post("/api/auth/register-send-otp", json={"email": "newuser@example.com"})
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "Registration OTP" in data["message"] or "OTP" in data["message"]

def test_register_send_otp_duplicate_email(mock_dynamodb_tables):
    mock_users, _ = mock_dynamodb_tables
    client.post("/api/auth/register", json={
        "full_name": "Existing User",
        "email": "existing@example.com",
        "city": "Chennai",
        "password": "Password123!"
    })

    res = client.post("/api/auth/register-send-otp", json={"email": "existing@example.com"})
    assert res.status_code == 400
    assert "already exists" in res.json()["detail"]

def test_otp_verification_and_expiration(mock_dynamodb_tables):
    _, mock_otps = mock_dynamodb_tables
    clean_email = "testotp@example.com"

    # 1. Verify invalid email OTP
    res_inv = client.post("/api/auth/verify-otp", json={"email": clean_email, "otp": "999999"})
    assert res_inv.status_code == 400

    # 2. Store valid OTP
    from app.database.users_db import generate_and_store_otp, verify_otp_code
    stored_otp = generate_and_store_otp(clean_email)
    assert len(stored_otp) == 6

    # 3. Verify valid OTP
    res_val = client.post("/api/auth/verify-otp", json={"email": clean_email, "otp": stored_otp})
    assert res_val.status_code == 200
    assert res_val.json()["success"] is True

    # 4. Test expired OTP
    mock_otps.items[clean_email]["expires_at"] = (datetime.utcnow() - timedelta(minutes=1)).isoformat()
    mock_otps.items[clean_email]["otp"] = "123456"
    with pytest.raises(ValueError, match="expired"):
        verify_otp_code(clean_email, "123456")

def test_user_registration_and_login():
    # Register user
    reg_payload = {
        "full_name": "Test Farmer",
        "email": "farmer@example.com",
        "city": "Coimbatore",
        "password": "SecurePassword123"
    }
    reg_res = client.post("/api/auth/register", json=reg_payload)
    assert reg_res.status_code == 200
    user = reg_res.json()["user"]
    assert user["email"] == "farmer@example.com"
    assert user["full_name"] == "Test Farmer"
    assert isinstance(user["id"], int)

    # Duplicate registration error
    dup_res = client.post("/api/auth/register", json=reg_payload)
    assert dup_res.status_code == 400

    # Valid Login
    login_res = client.post("/api/auth/login", json={
        "email": "farmer@example.com",
        "password": "SecurePassword123"
    })
    assert login_res.status_code == 200
    assert login_res.json()["success"] is True

    # Invalid Password Login
    bad_login = client.post("/api/auth/login", json={
        "email": "farmer@example.com",
        "password": "WrongPassword"
    })
    assert bad_login.status_code == 401

def test_google_user_creation_and_account_linking():
    from app.database.users_db import get_or_create_google_user, get_user_by_email, create_user

    # 1. New Google user creation
    g_user = get_or_create_google_user("g123456", "googleuser@example.com", "Google Farmer", "http://pic.jpg")
    assert g_user["google_id"] == "g123456"
    assert g_user["auth_provider"] == "google"

    # 2. Existing password user linking Google account
    create_user("Password User", "pwduser@example.com", "Madurai", "Secret1234")
    linked = get_or_create_google_user("g987654", "pwduser@example.com", "Password User", "http://pic2.jpg")
    assert linked["google_id"] == "g987654"
    assert linked["auth_provider"] == "google"

def test_update_user_city_and_password_reset():
    from app.database.users_db import create_user, generate_and_store_otp, verify_otp_code

    user = create_user("City User", "cityuser@example.com", "Salem", "Pass123456")
    user_id = user["id"]

    # Update City
    update_res = client.post("/api/auth/update-city", json={"user_id": user_id, "city": "Erode"})
    assert update_res.status_code == 200
    assert update_res.json()["user"]["city"] == "Erode"

    # Password Reset Flow
    otp = generate_and_store_otp("cityuser@example.com")
    verify_otp_code("cityuser@example.com", otp)

    reset_res = client.post("/api/auth/reset-password", json={
        "email": "cityuser@example.com",
        "new_password": "NewSecretPassword123"
    })
    assert reset_res.status_code == 200

    # Login with new password
    login_new = client.post("/api/auth/login", json={
        "email": "cityuser@example.com",
        "password": "NewSecretPassword123"
    })
    assert login_new.status_code == 200
