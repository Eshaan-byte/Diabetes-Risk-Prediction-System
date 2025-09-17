from sqlmodel import SQLModel, Field
from typing import Optional
import datetime

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str
    hashed_password: str
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

class HealthRecord(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int
    pregnancies: int
    glucose: float
    bloodPressure: float
    insulin: float
    bMI: float
    diabeticFamily: int
    age: int
    risk_score: float
    prediction: str
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
