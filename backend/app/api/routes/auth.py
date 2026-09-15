from fastapi import APIRouter, HTTPException, status
import uuid
from app.schemas.auth_schema import UserRegisterRequest, UserLoginRequest, AuthResponse, UserResponse, GoogleAuthRequest, CityUpdateRequest
from app.database.users_db import create_user, authenticate_user, get_user_by_email, get_or_create_google_user, update_user_city
from app.utils.config import settings

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

router = APIRouter()

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
    """Authenticates user via Google OAuth ID Token."""
    try:
        # We need the client ID from settings to verify securely, but we allow unverified for demo if missing
        client_id = settings.GOOGLE_CLIENT_ID if hasattr(settings, 'GOOGLE_CLIENT_ID') else None
        
        # Verify the token
        try:
            idinfo = id_token.verify_oauth2_token(
                payload.id_token, 
                google_requests.Request(), 
                client_id
            )
            
            # Additional checks can be placed here (e.g. check hd for gsuite domains)
            if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                raise ValueError('Wrong issuer.')
                
        except ValueError as e:
            # Invalid token
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid Google token: {str(e)}"
            )

        google_id = idinfo['sub']
        email = idinfo['email']
        name = idinfo.get('name', 'FarmPulse User')
        picture = idinfo.get('picture')

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
