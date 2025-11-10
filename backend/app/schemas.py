from pydantic import BaseModel, EmailStr, Field, validator
import datetime
from typing import Optional

#Schemas for user inputs

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    first_name: str = Field(..., min_length=1, max_length=50)
    last_name: str = Field(..., min_length=1, max_length=50)
    username: str = Field(..., min_length=3, max_length=30)
    phone_number: str = Field(..., min_length=10, max_length=15)
    date_of_birth: datetime.date

    @validator('username')
    def validate_username(cls, v):
        if not all(c.isalnum() or c == "_" for c in v):
            raise ValueError("Username can only contain letters, numbers, and underscores")
        return v

    @validator('password')
    def validate_password(cls, v):
        if not any(c.isalpha() for c in v) or not any(c.isdigit() for c in v):
            raise ValueError("Password must contain both letters and numbers")
        return v

    @validator('date_of_birth')
    def validate_date_of_birth(cls, v):
        if v >= datetime.date.today():
            raise ValueError("Date of birth must be in the past")
        # Check for reasonable age range (not older than 120 years)
        min_date = datetime.date.today() - datetime.timedelta(days=120*365)
        if v < min_date:
            raise ValueError("Date of birth is too far in the past")
        return v

class UserLogin(BaseModel):
    email: EmailStr | str
    password: str

class ResendVerification(BaseModel):
    email: EmailStr

class PatientData(BaseModel):
    pregnancies: int = Field(..., ge=0, le=20)
    glucose: int = Field(..., ge=0, le=300)
    blood_pressure: int = Field(..., ge=0, le=200)
    insulin: int = Field(..., ge=0, le=1000)
    bmi: float = Field(..., ge=10.0, le=70.0)
    diabetic_family: int = Field(..., ge=0, le=1)
    age: int = Field(..., ge=1, le=120)

    @validator('age')
    def validate_age_not_zero(cls, v):
        if v == 0:
            raise ValueError("Age cannot be 0 (division by zero risk)")
        return v

# PatientData with modified datetime
class PatientDataWithCreatedAt(BaseModel):
    pregnancies: int = Field(..., ge=0, le=20)
    glucose: int = Field(..., ge=0, le=300)
    blood_pressure: int = Field(..., ge=0, le=200)
    insulin: int = Field(..., ge=0, le=1000)
    bmi: float = Field(..., ge=10.0, le=70.0)
    diabetic_family: int = Field(..., ge=0, le=1)
    age: int = Field(..., ge=1, le=120)
    created_at: datetime.datetime  # make created_at mandatory here

    @validator('age')
    def validate_age_not_zero(cls, v):
        if v == 0:
            raise ValueError("Age cannot be 0 (division by zero risk)")
        return v

#PatientData for PUT method
class PatientDataUpdate(BaseModel):
    pregnancies: Optional[int] = Field(None, ge=0, le=20)
    glucose: Optional[int] = Field(None, ge=0, le=300)
    blood_pressure: Optional[int] = Field(None, ge=0, le=200)
    insulin: Optional[int] = Field(None, ge=0, le=1000)
    bmi: Optional[float] = Field(None, ge=10.0, le=70.0)
    diabetic_family: Optional[int] = Field(None, ge=0, le=1)
    age: Optional[int] = Field(None, ge=1, le=120)
    created_at: Optional[datetime.datetime] = None  # Allow updating created_at if needed

    @validator('age')
    def validate_age_not_zero(cls, v):
        if v is not None and v == 0:
            raise ValueError("Age cannot be 0 (division by zero risk)")
        return v