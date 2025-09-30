from pydantic import BaseModel, EmailStr
import datetime

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

class PatientData(BaseModel):
    pregnancies: int
    glucose: int
    blood_pressure: int
    insulin: int
    bmi: float
    diabetic_family: int
    age: int