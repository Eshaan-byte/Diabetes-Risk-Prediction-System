import jwt
import os
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from datetime import datetime, timedelta
from ..schemas import UserCreate, UserLogin
from ..models import users
from ..database import get_session
from sqlmodel import Session, select
from passlib.hash import bcrypt

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
    # Check if email already exists
    existing_user = session.exec(select(users).where(users.email == user.email)).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    #Hashed the password and create new user
    hashed_pw = bcrypt.hash(user.password)
    db_user = users(email=user.email, password_hash=hashed_pw)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return {"id": db_user.user_id, "email": db_user.email, "created_at": db_user.created_at}

#API call to login
@router.post("/login")
def login(user: UserLogin, session: Session = Depends(get_session)):
    query = select(users).where(users.email == user.email)
    db_user = session.exec(query).first()
    if not db_user or not bcrypt.verify(user.password, db_user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": str(db_user.user_id)})
    return {"access_token": token, "token_type": "bearer"}
