from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.schemas import PatientData, PatientDataWithCreatedAt, PatientDataUpdate
from app.models import health_records, users
from app.ml.inferences import predict_risk
from app.database import get_session
from .auth import get_current_user
from typing import List

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

#POST a health record with a custom datetime
@router.post("/custom")
def add_record_with_created_at(
    record: PatientDataWithCreatedAt,
    session: Session = Depends(get_session),
    current_user: users = Depends(get_current_user)
):
    record_dict = record.dict()

    # Separate data for prediction: exclude created_at
    prediction_input = {k: v for k, v in record_dict.items() if k != "created_at"}

    # Call prediction logic
    prediction_result = predict_risk(prediction_input)

    # Combine original data (including created_at) and prediction result
    record_data = {**record_dict, **prediction_result}

    # Save into DB
    db_record = health_records(**record_data, user_id=current_user.user_id)
    session.add(db_record)
    session.commit()
    session.refresh(db_record)
    return db_record

#POST multiple health record with a custom datetime
@router.post("/bulk")
def add_multiple_records(
    records: List[PatientDataWithCreatedAt],
    session: Session = Depends(get_session),
    current_user: users = Depends(get_current_user)
):
    #make a list for storing the records
    db_records = []

    #do for loop to do prediction for each record
    for record in records:
        record_dict = record.dict()
        # Separate data for prediction: exclude created_at
        prediction_input = {k: v for k, v in record_dict.items() if k != "created_at"}
        prediction = predict_risk(prediction_input)
        record_data = {**record_dict, **prediction, "user_id": current_user.user_id}
        db_record = health_records(**record_data)
        db_records.append(db_record)

    #Save into DB
    session.add_all(db_records)
    session.commit()
    return {"message": f"{len(db_records)} records added successfully"}

#GET all the Health Records for the current user
@router.get("/my-records")
def get_my_records(
    session: Session = Depends(get_session),
    current_user: users = Depends(get_current_user)
):
    records = session.exec(
        select(health_records)
        .where(health_records.user_id == current_user.user_id)
        .order_by(health_records.created_at.asc())
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

#PUT (edit) one record of the current user
@router.put("/{record_id}")
def update_record(
    record_id: int,
    record_update: PatientDataUpdate,
    session: Session = Depends(get_session),
    current_user: users = Depends(get_current_user)
):
    db_record = session.query(health_records).filter(
        health_records.record_id == record_id,
        health_records.user_id == current_user.user_id
    ).first()

    if not db_record:
        raise HTTPException(status_code=404, detail="Record not found")

    # Convert incoming update to dict, excluding unset fields
    update_data = record_update.dict(exclude_unset=True)

    # Update db_record fields with incoming data
    for key, value in update_data.items():
        setattr(db_record, key, value)

    # Prepare prediction input by excluding created_at
    prediction_input = {k: v for k, v in update_data.items() if k != "created_at"}

    # Call prediction with only the updated data
    prediction_result = predict_risk(prediction_input)

    # Update prediction fields on the record
    for key, value in prediction_result.items():
        setattr(db_record, key, value)

    session.add(db_record)
    session.commit()
    session.refresh(db_record)
    return db_record

#DELETE one record of the current user
@router.delete("/{record_id}")
def delete_record(
    record_id: int,
    session: Session = Depends(get_session),
    current_user: users = Depends(get_current_user)
):
    # Query the record by ID and user ownership (assuming each record belongs to a user)
    db_record = session.query(health_records).filter(
        health_records.record_id == record_id,
        health_records.user_id == current_user.user_id
    ).first()

    #Exception handling if record_id not found
    if not db_record:
        raise HTTPException(status_code=404, detail="Record not found")

    # Delete the record
    session.delete(db_record)
    session.commit()
    return {"detail": "Record deleted successfully"}