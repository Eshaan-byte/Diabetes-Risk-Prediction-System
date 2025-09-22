from pydantic import BaseModel, EmailStr

#Schemas for user inputs

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class PatientData(BaseModel):
    pregnancies: int
    glucose: int
    blood_pressure: int
    insulin: int
    bmi: float
    diabetic_family: int
    age: int