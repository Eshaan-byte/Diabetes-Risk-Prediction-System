from pydantic import BaseModel, EmailStr
import datetime
from typing import Optional

#Schemas for user inputs

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    username: str
    phone_number: str
    date_of_birth: datetime.date

class UserLogin(BaseModel):
    email: EmailStr | str
    password: str

class ResendVerification(BaseModel):
    email: EmailStr

class PatientData(BaseModel):
    pregnancies: int
    glucose: int
    blood_pressure: int
    insulin: int
    bmi: float
    diabetic_family: int
    age: int

# PatientData with modified datetime
class PatientDataWithCreatedAt(BaseModel):
    pregnancies: int
    glucose: int
    blood_pressure: int
    insulin: int
    bmi: float
    diabetic_family: int
    age: int
    created_at: datetime.datetime  # make created_at mandatory here

#PatientData for PUT method
class PatientDataUpdate(BaseModel):
    pregnancies: Optional[int] = None
    glucose: Optional[int] = None
    blood_pressure: Optional[int] = None
    insulin: Optional[int] = None
    bmi: Optional[float] = None
    diabetic_family: Optional[int] = None
    age: Optional[int] = None
    created_at: Optional[datetime.datetime] = None  # Allow updating created_at if needed