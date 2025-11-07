import jwt
import os
import secrets
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from datetime import datetime, timedelta
from ..schemas import UserCreate, UserLogin, ResendVerification
from ..models import users
from ..database import get_session
from sqlmodel import Session, select
from passlib.hash import bcrypt
from fastapi.encoders import jsonable_encoder
from sqlalchemy import or_
from ..email_service import send_verification_email

router = APIRouter()

#Get the secret key from .env
SECRET_KEY = os.getenv("SECRET_KEY")

#set the configuration for the access token
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

#function to create access token
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

#Function to check the current user
def get_current_user(token: str = Depends(oauth2_scheme), session: Session = Depends(get_session)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = session.get(users, UUID(user_id))
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

#API call to signup an user
@router.post("/signup")
def signup(user: UserCreate, session: Session = Depends(get_session)):
    # Check if email or username already exists
    existing_user = session.exec(
        select(users).where((users.email == user.email) | (users.username == user.username))
    ).first()

    if existing_user:
        if existing_user.email == user.email:
            raise HTTPException(status_code=400, detail="Email already registered")
        if existing_user.username == user.username:
            raise HTTPException(status_code=400, detail="Username already registered")

    # Generate verification token
    verification_token = secrets.token_urlsafe(32)
    token_expiry = datetime.utcnow() + timedelta(hours=24)

    #Hashed the password and create new user
    hashed_pw = bcrypt.hash(user.password)
    db_user = users(
        email=user.email,
        username=user.username,
        first_name=user.first_name,
        last_name=user.last_name,
        phone_number=user.phone_number,
        password_hash=hashed_pw,
        date_of_birth=user.date_of_birth,
        is_verified=False,
        verification_token=verification_token,
        verification_token_expiry=token_expiry
    )
    session.add(db_user)
    session.commit()
    session.refresh(db_user)

    # Send verification email
    email_sent = send_verification_email(db_user.email, db_user.username, verification_token)

    if email_sent[0]:
        # Return user data without access token (user needs to verify email first)
        return {
            "id": db_user.user_id,
            "email": db_user.email,
            "username": db_user.username,
            "first_name": db_user.first_name,
            "last_name": db_user.last_name,
            "phone_number": db_user.phone_number,
            "date_of_birth": user.date_of_birth,
            "created_at": db_user.created_at,
            "is_verified": db_user.is_verified,
            "message": "Account created successfully. Please check your email to verify your account.",
            "verification_link": email_sent[1] #added because of the inability of render to send SMTP to the SMTP Host            
        }
    else:
        raise HTTPException(status_code=500, detail=f"Failed to send verification email. (Temporary solution to resolve the Render issue: {email_sent[1]} )")
    
#API call to verify email
@router.get("/verify-email")
def verify_email(token: str, session: Session = Depends(get_session)):
    # Find user with this verification token
    user = session.exec(
        select(users).where(users.verification_token == token)
    ).first()

    if not user:
        raise HTTPException(status_code=400, detail="Invalid verification token")

    # Check if token has expired
    if user.verification_token_expiry and datetime.utcnow() > user.verification_token_expiry:
        raise HTTPException(status_code=400, detail="Verification token has expired. Please request a new one.")

    # Check if already verified
    if user.is_verified:
        return {"message": "Email already verified. You can now log in."}

    # Mark user as verified
    user.is_verified = True
    user.verification_token = None
    user.verification_token_expiry = None
    session.add(user)
    session.commit()

    return {
        "message": "Email verified successfully! You can now log in to your account.",
        "email": user.email,
        "username": user.username
    }


#API call to resend verification email
@router.post("/resend-verification")
def resend_verification(data: ResendVerification, session: Session = Depends(get_session)):
    # Find user by email
    user = session.exec(
        select(users).where(users.email == data.email)
    ).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.is_verified:
        raise HTTPException(status_code=400, detail="Email already verified")

    # Generate new verification token
    verification_token = secrets.token_urlsafe(32)
    token_expiry = datetime.utcnow() + timedelta(hours=24)

    user.verification_token = verification_token
    user.verification_token_expiry = token_expiry
    session.add(user)
    session.commit()

    # Send verification email
    email_sent = send_verification_email(user.email, user.username, verification_token)

    if email_sent[0]:
        return {
                "message": "Verification email sent successfully. Please check your inbox.", 
                "verification_link": f"(Temporary solution to resolve the Render issue: {email_sent[1]} )"  #added because of the inability of render to send SMTP to the SMTP Host }
        }
    else:
        raise HTTPException(status_code=500, detail=f"Failed to send verification email. (Temporary solution to resolve the Render issue: {email_sent[1]} )")


#API call to login
@router.post("/login")
def login(user: UserLogin, session: Session = Depends(get_session)):
    query = select(users).where(or_(users.email == user.email, users.username == user.email))
    db_user = session.exec(query).first()
    if not db_user or not bcrypt.verify(user.password, db_user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Check if email is verified
    if not db_user.is_verified:
        raise HTTPException(
            status_code=403,
            detail={
                "message": "Email not verified. Please check your email and verify your account before logging in.",
                "email": db_user.email
            }
        )

    token = create_access_token({"sub": str(db_user.user_id)})
    return {
        "id": db_user.user_id,
        "email": db_user.email,
        "username": db_user.username,
        "first_name": db_user.first_name,
        "last_name": db_user.last_name,
        "phone_number": db_user.phone_number,
        "date_of_birth": db_user.date_of_birth,
        "created_at": db_user.created_at,
        "access_token": token,
        "token_type": "bearer"}
