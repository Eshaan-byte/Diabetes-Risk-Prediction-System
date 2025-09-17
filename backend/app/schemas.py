from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class PatientData(BaseModel):
    pregnancies: int
    glucose: int
    bloodPressure: int
    insulin: int
    bMI: float
    diabeticFamily: int
    age: int

class PredictionResponse(BaseModel):
    risk: float
    label: str
