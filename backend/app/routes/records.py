from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.schemas import PatientData
from app.models import HealthRecord
from app.database import get_session

router = APIRouter()

@router.post("/")
def add_record(record: PatientData, session: Session = Depends(get_session)):
    db_record = HealthRecord(**record.dict(), user_id=1)  # TODO: link to auth
    session.add(db_record)
    session.commit()
    session.refresh(db_record)
    return db_record

@router.get("/")
def list_records(session: Session = Depends(get_session)):
    records = session.exec(select(HealthRecord)).all()
    return records
