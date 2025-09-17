from fastapi import APIRouter, Depends
from ..schemas import UserCreate, UserLogin
from ..models import User
from ..database import get_session
from sqlmodel import Session, select
from passlib.hash import bcrypt

router = APIRouter()

@router.post("/signup")
def signup(user: UserCreate, session: Session = Depends(get_session)):
    hashed_pw = bcrypt.hash(user.password)
    db_user = User(email=user.email, hashed_password=hashed_pw)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return {"id": db_user.id, "email": db_user.email}

@router.post("/login")
def login(user: UserLogin, session: Session = Depends(get_session)):
    query = select(User).where(User.email == user.email)
    db_user = session.exec(query).first()
    if not db_user or not bcrypt.verify(user.password, db_user.hashed_password):
        return {"error": "Invalid credentials"}
    return {"message": "Login successful"}
