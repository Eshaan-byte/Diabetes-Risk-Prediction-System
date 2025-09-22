from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.schemas import PatientData
from app.models import health_records, users
from app.ml.inferences import predict_risk
from app.database import get_session
from .auth import get_current_user

router = APIRouter()

#POST a health record
@router.post("/")
def add_record(
    record: PatientData, 
    session: Session = Depends(get_session),
    current_user: users = Depends(get_current_user)
):
    # Call the prediction logic first
    result = predict_risk(record.dict())

    # Add prediction to the record
    record_data = record.dict()
    record_data.update(result)  # adds 'outcome' and 'prediction_prob' fields

    #Save into DB
    db_record = health_records(**record_data, user_id=current_user.user_id)
    session.add(db_record)
    session.commit()
    session.refresh(db_record)
    return db_record

#GET all the Health Records for the current user
@router.get("/my-records")
def get_my_records(
    session: Session = Depends(get_session),
    current_user: users = Depends(get_current_user)
):
    records = session.exec(
        select(health_records).where(health_records.user_id == current_user.user_id)
    ).all()
    return records

#GET one record of the current user
@router.get("/{recordId}")
def get_record(
    recordId: int, 
    session: Session = Depends(get_session),
    current_user: users = Depends(get_current_user)
):
    record = session.get(health_records, recordId)
    if not record or record.user_id != current_user.user_id:
        raise HTTPException(status_code=404, detail="Record not found")
    return record