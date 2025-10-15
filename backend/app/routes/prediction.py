from fastapi import APIRouter
from app.schemas import PatientData
from app.ml.inferences import predict_risk

router = APIRouter()

#Raw API call just to predict without saving any data into database
@router.post("/")
def predict(data: PatientData):
    result = predict_risk(data.dict())
    return result, data
