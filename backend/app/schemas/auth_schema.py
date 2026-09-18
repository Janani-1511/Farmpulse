from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UserRegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, description="Full Name of the user")
    email: str = Field(..., description="Email address")
    city: str = Field(..., min_length=2, description="User's city name")
    password: str = Field(..., min_length=8, description="Password")


class UserLoginRequest(BaseModel):
    email: str = Field(..., description="Email address")
    password: str = Field(..., description="Password")

class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    city: str
    created_at: str
    auth_provider: Optional[str] = "password"
    google_id: Optional[str] = None
    profile_picture: Optional[str] = None

class AuthResponse(BaseModel):
    success: bool
    message: str
    user: Optional[UserResponse] = None
    token: Optional[str] = None

class GoogleAuthRequest(BaseModel):
    id_token: str = Field(..., description="Google ID Token from frontend")

class CityUpdateRequest(BaseModel):
    user_id: int
    city: str = Field(..., min_length=2, description="User's city name")

class SendOtpRequest(BaseModel):
    email: str = Field(..., description="Email address")

class VerifyOtpRequest(BaseModel):
    email: str = Field(..., description="Email address")
    otp: str = Field(..., min_length=6, max_length=6, description="6-digit OTP code")

class PasswordResetRequest(BaseModel):
    email: str = Field(..., description="Email address")
    new_password: str = Field(..., min_length=8, description="New password")

class RegisterVerifyRequest(BaseModel):
    full_name: str = Field(..., min_length=2, description="Full Name of the user")
    email: str = Field(..., description="Email address")
    city: str = Field(..., min_length=2, description="User's city name")
    password: str = Field(..., min_length=8, description="Password")
    otp: str = Field(..., min_length=6, max_length=6, description="6-digit OTP code")



