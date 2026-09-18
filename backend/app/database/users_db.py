import sqlite3
import os
import hashlib
import secrets
from datetime import datetime
from typing import Optional, Dict, Any

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "farmpulse.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_users_db():
    """Initializes the users database table and OTP table if they do not exist."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            city TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            salt TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS password_reset_otps (
            email TEXT PRIMARY KEY,
            otp TEXT NOT NULL,
            expires_at TEXT NOT NULL,
            verified INTEGER DEFAULT 0
        )
    """)
    # Safely add Google Auth columns to existing table
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN auth_provider TEXT DEFAULT 'password'")
        cursor.execute("ALTER TABLE users ADD COLUMN google_id TEXT")
        cursor.execute("ALTER TABLE users ADD COLUMN profile_picture TEXT")
    except sqlite3.OperationalError:
        pass # Columns already exist
    conn.commit()
    conn.close()

def generate_and_store_otp(email: str) -> str:
    """Generates a 6-digit OTP and stores it for whatever email address is typed by the user."""
    import random
    from datetime import timedelta
    
    init_users_db()
    clean_email = email.strip().lower()

    otp = f"{random.randint(100000, 999999)}"
    expires_at = (datetime.utcnow() + timedelta(minutes=10)).isoformat()

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO password_reset_otps (email, otp, expires_at, verified)
        VALUES (?, ?, ?, 0)
        ON CONFLICT(email) DO UPDATE SET
            otp = excluded.otp,
            expires_at = excluded.expires_at,
            verified = 0
    """, (clean_email, otp, expires_at))
    conn.commit()
    conn.close()

    return otp

def verify_otp_code(email: str, otp: str) -> bool:
    """Verifies if the submitted OTP matches and is not expired."""
    init_users_db()
    clean_email = email.strip().lower()
    clean_otp = otp.strip()

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM password_reset_otps WHERE LOWER(email) = ?", (clean_email,))
    row = cursor.fetchone()

    if not row:
        conn.close()
        raise ValueError("No OTP request found for this email address. Please request a new OTP.")

    row_dict = dict(row)
    expires_at = datetime.fromisoformat(row_dict["expires_at"])

    if datetime.utcnow() > expires_at:
        conn.close()
        raise ValueError("The OTP code has expired. Please request a new code.")

    if row_dict["otp"] != clean_otp:
        conn.close()
        raise ValueError("Invalid OTP code. Please check and try again.")

    cursor.execute("UPDATE password_reset_otps SET verified = 1 WHERE LOWER(email) = ?", (clean_email,))
    conn.commit()
    conn.close()
    return True

def reset_password(email: str, new_password: str) -> bool:
    """Resets or sets user password by email address after OTP verification."""
    init_users_db()
    clean_email = email.strip().lower()

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT verified FROM password_reset_otps WHERE LOWER(email) = ?", (clean_email,))
    row = cursor.fetchone()
    if not row or dict(row).get("verified") != 1:
        conn.close()
        raise ValueError("Email verification required. Please request and verify OTP first.")

    user = get_user_by_email(clean_email)
    pwd_hash, salt = hash_password(new_password)

    if user:
        cursor.execute("""
            UPDATE users
            SET password_hash = ?, salt = ?
            WHERE id = ?
        """, (pwd_hash, salt, user["id"]))
    else:
        created_at = datetime.utcnow().isoformat()
        name_from_email = clean_email.split('@')[0].capitalize()
        cursor.execute("""
            INSERT INTO users (full_name, email, city, password_hash, salt, created_at, auth_provider)
            VALUES (?, ?, 'Coimbatore', ?, ?, ?, 'password')
        """, (name_from_email, clean_email, pwd_hash, salt, created_at))

    cursor.execute("DELETE FROM password_reset_otps WHERE LOWER(email) = ?", (clean_email,))
    conn.commit()
    conn.close()
    return True


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

def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Retrieves user by email address."""
    init_users_db()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE LOWER(email) = LOWER(?)", (email.strip(),))
    row = cursor.fetchone()
    conn.close()
    if row:
        return dict(row)
    return None

def get_user_by_id(user_id: int) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return dict(row)
    return None

def create_user(full_name: str, email: str, city: str, password: str) -> Dict[str, Any]:
    """Creates a new user account if the email does not already exist."""
    init_users_db()
    
    clean_email = email.strip().lower()
    existing = get_user_by_email(clean_email)
    if existing:
        raise ValueError("An account with this email address already exists. Please sign in.")

    pwd_hash, salt = hash_password(password)
    created_at = datetime.utcnow().isoformat()

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO users (full_name, email, city, password_hash, salt, created_at, auth_provider)
        VALUES (?, ?, ?, ?, ?, ?, 'password')
    """, (full_name.strip(), clean_email, city.strip(), pwd_hash, salt, created_at))
    user_id = cursor.lastrowid
    conn.commit()
    conn.close()

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
    init_users_db()
    conn = get_db_connection()
    cursor = conn.cursor()
    clean_email = email.strip().lower()
    
    cursor.execute("SELECT * FROM users WHERE LOWER(email) = ?", (clean_email,))
    row = cursor.fetchone()
    
    if row:
        user = dict(row)
        # Link account if not linked
        if not user.get('google_id'):
            cursor.execute("""
                UPDATE users 
                SET google_id = ?, auth_provider = 'google', profile_picture = COALESCE(profile_picture, ?)
                WHERE id = ?
            """, (google_id, profile_picture, user['id']))
            conn.commit()
            user['google_id'] = google_id
            user['auth_provider'] = 'google'
            user['profile_picture'] = user.get('profile_picture') or profile_picture
        conn.close()
        return user
        
    # If user doesn't exist, create new
    created_at = datetime.utcnow().isoformat()
    cursor.execute("""
        INSERT INTO users (full_name, email, city, password_hash, salt, created_at, auth_provider, google_id, profile_picture)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (full_name.strip(), clean_email, '', '', '', created_at, 'google', google_id, profile_picture))
    user_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return {
        "id": user_id,
        "full_name": full_name.strip(),
        "email": clean_email,
        "city": '',
        "created_at": created_at,
        "auth_provider": "google",
        "google_id": google_id,
        "profile_picture": profile_picture
    }

def update_user_city(user_id: int, city: str) -> bool:
    init_users_db()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET city = ? WHERE id = ?", (city.strip(), user_id))
    conn.commit()
    rowcount = cursor.rowcount
    conn.close()
    return rowcount > 0

def authenticate_user(email: str, password: str) -> Optional[Dict[str, Any]]:
    """Verifies email and password credentials securely."""
    init_users_db()
    user = get_user_by_email(email)
    if not user:
        return None
    # For users who only use Google Sign-in and have no password hash setup
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


