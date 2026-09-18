from fastapi import APIRouter, HTTPException, status
import uuid
from app.schemas.auth_schema import UserRegisterRequest, UserLoginRequest, AuthResponse, UserResponse, GoogleAuthRequest, CityUpdateRequest, PasswordResetRequest, SendOtpRequest, VerifyOtpRequest, RegisterVerifyRequest
from app.database.users_db import create_user, authenticate_user, get_user_by_email, get_or_create_google_user, update_user_city, reset_password, generate_and_store_otp, verify_otp_code
from app.utils.email import send_otp_email

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

router = APIRouter()

@router.post("/register-send-otp", response_model=AuthResponse)
def register_send_otp(payload: SendOtpRequest):
    """Checks if email exists and sends registration verification OTP code to user's email address."""
    try:
        clean_email = payload.email.strip().lower()
        existing = get_user_by_email(clean_email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email address already exists. Please sign in."
            )

        otp = generate_and_store_otp(clean_email)
        sent = send_otp_email(clean_email, otp)
        
        if sent:
            msg = f"Registration verification OTP code sent to {clean_email}! Please check your inbox or spam folder."
        else:
            msg = f"Registration OTP verification code generated for {clean_email}! (Code: {otp})"

        return AuthResponse(
            success=True,
            message=msg
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send registration OTP: {str(e)}"
        )

@router.post("/register-verify-otp", response_model=AuthResponse)
def register_verify_otp(payload: RegisterVerifyRequest):
    """Verifies OTP code and completes user registration."""
    try:
        clean_email = payload.email.strip().lower()
        verify_otp_code(clean_email, payload.otp)

        user_dict = create_user(
            full_name=payload.full_name,
            email=clean_email,
            city=payload.city,
            password=payload.password
        )
        token = str(uuid.uuid4())
        return AuthResponse(
            success=True,
            message="Email verified and account created successfully! Welcome to FarmPulse.",
            user=UserResponse(**user_dict),
            token=token
        )
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration verification error: {str(e)}"
        )

@router.post("/register", response_model=AuthResponse)
def register(payload: UserRegisterRequest):
    """Registers a new FarmPulse user account in SQLite database."""
    try:
        user_dict = create_user(
            full_name=payload.full_name,
            email=payload.email,
            city=payload.city,
            password=payload.password
        )
        token = str(uuid.uuid4())
        return AuthResponse(
            success=True,
            message="Account created successfully! Welcome to FarmPulse.",
            user=UserResponse(**user_dict),
            token=token
        )
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration error: {str(e)}"
        )

@router.post("/login", response_model=AuthResponse)
def login(payload: UserLoginRequest):
    """Authenticates existing FarmPulse user credentials."""
    user_dict = authenticate_user(email=payload.email, password=payload.password)
    if not user_dict:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please try again."
        )

    token = str(uuid.uuid4())
    return AuthResponse(
        success=True,
        message="Sign in successful!",
        user=UserResponse(**user_dict),
        token=token
    )

@router.post("/google", response_model=AuthResponse)
def google_auth(payload: GoogleAuthRequest):
    """Authenticates user via Google OAuth ID Token or Access Token."""
    import requests as http_requests
    try:
        google_id = None
        email = None
        name = "FarmPulse User"
        picture = None

        # 1. Try verifying as ID token using google-auth library
        try:
            client_id = settings.GOOGLE_CLIENT_ID if hasattr(settings, 'GOOGLE_CLIENT_ID') else None
            idinfo = id_token.verify_oauth2_token(
                payload.id_token, 
                google_requests.Request(), 
                client_id
            )
            google_id = idinfo.get('sub')
            email = idinfo.get('email')
            name = idinfo.get('name', 'FarmPulse User')
            picture = idinfo.get('picture')
        except Exception:
            pass

        # 2. Try fetching profile via Google UserInfo API (AccessToken)
        if not google_id:
            try:
                userinfo_res = http_requests.get(
                    "https://www.googleapis.com/oauth2/v3/userinfo",
                    headers={"Authorization": f"Bearer {payload.id_token}"},
                    timeout=8
                )
                if userinfo_res.status_code == 200:
                    userinfo = userinfo_res.json()
                    google_id = userinfo.get('sub')
                    email = userinfo.get('email')
                    name = userinfo.get('name', 'FarmPulse User')
                    picture = userinfo.get('picture')
            except Exception:
                pass

        # 3. Fallback: Try Google TokenInfo API
        if not google_id:
            try:
                tokeninfo_res = http_requests.get(
                    f"https://oauth2.googleapis.com/tokeninfo?id_token={payload.id_token}",
                    timeout=8
                )
                if tokeninfo_res.status_code == 200:
                    tokeninfo = tokeninfo_res.json()
                    google_id = tokeninfo.get('sub')
                    email = tokeninfo.get('email')
                    name = tokeninfo.get('name', 'FarmPulse User')
                    picture = tokeninfo.get('picture')
            except Exception:
                pass

        if not email or not google_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unable to verify Google authentication token. Please try again."
            )

        user_dict = get_or_create_google_user(google_id, email, name, picture)
        token = str(uuid.uuid4())

        return AuthResponse(
            success=True,
            message="Google Sign in successful!",
            user=UserResponse(**user_dict),
            token=token
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Google authentication error: {str(e)}"
        )

@router.post("/update-city", response_model=AuthResponse)
def update_city(payload: CityUpdateRequest):
    """Updates city for a given user, usually after Google Auth."""
    from app.database.users_db import get_user_by_id
    success = update_user_city(payload.user_id, payload.city)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found or unable to update."
        )
    
    user_dict = get_user_by_id(payload.user_id)
    return AuthResponse(
        success=True,
        message="Profile updated successfully!",
        user=UserResponse(**user_dict) if user_dict else None
    )

from app.utils.email import send_otp_email

@router.post("/send-otp", response_model=AuthResponse)
def send_otp(payload: SendOtpRequest):
    """Generates and sends a 6-digit verification OTP to the user's registered email address."""
    try:
        clean_email = payload.email.strip().lower()
        otp = generate_and_store_otp(clean_email)
        sent = send_otp_email(clean_email, otp)
        
        if sent:
            msg = f"OTP verification code sent to {clean_email}! Please check your inbox or spam folder."
        else:
            msg = f"OTP verification code generated for {clean_email}! (Verification Code: {otp})"

        return AuthResponse(
            success=True,
            message=msg
        )
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(ve)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send OTP: {str(e)}"
        )

@router.post("/verify-otp", response_model=AuthResponse)
def verify_otp(payload: VerifyOtpRequest):
    """Verifies the submitted 6-digit OTP code."""
    try:
        verify_otp_code(email=payload.email, otp=payload.otp)
        return AuthResponse(
            success=True,
            message="OTP verified successfully! You can now set a new password."
        )
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"OTP verification error: {str(e)}"
        )

@router.post("/reset-password", response_model=AuthResponse)
def reset_password_route(payload: PasswordResetRequest):
    """Resets password for an existing user account."""
    try:
        reset_password(email=payload.email, new_password=payload.new_password)
        return AuthResponse(
            success=True,
            message="Password reset successfully! You can now sign in with your new password."
        )
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(ve)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Password reset failed: {str(e)}"
        )


