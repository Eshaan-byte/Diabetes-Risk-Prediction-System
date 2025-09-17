from fastapi import APIRouter
from app.schemas import PatientData
from app.ml.inferences import predict_risk

router = APIRouter()

@router.post("/")
def predict(data: PatientData):
    result = predict_risk(data.dict())
    return result
