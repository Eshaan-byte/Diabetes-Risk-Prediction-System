import os
import jwt
from datetime import datetime, timedelta

SECRET_KEY = os.getenv("SECRET_KEY", "changeme")

def create_token(data: dict, expires_in: int = 60):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=expires_in)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")
