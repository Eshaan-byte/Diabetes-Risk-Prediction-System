from uuid import UUID
from sqlmodel import SQLModel, Field
from typing import Optional
import datetime

#the model of users table
class users(SQLModel, table=True):
    user_id: UUID = Field(default=None, primary_key=True, sa_column_kwargs={"server_default": "gen_random_uuid()"})
    email: str
    password_hash: str
    first_name: str
    last_name: str
    username: str = Field(default=None, index=True, unique=True)
    phone_number: str
    date_of_birth: datetime.date = None
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

#the model of health_records table
class health_records(SQLModel, table=True):
    record_id: Optional[int] = Field(default=None, primary_key=True)
    user_id: UUID
    pregnancies: int
    glucose: int
    blood_pressure: int
    insulin: int
    bmi: float
    diabetic_family: int
    age: int
    outcome: str
    prediction_prob: float
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
