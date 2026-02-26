from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import extract
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import pandas as pd
import io
from database import get_db
from models.transaction import Transaction
from models.user import User
from middleware.auth import get_current_user
from ml.categorizer import predict_category
from ml.anomaly import detect_anomaly

router = APIRouter()

# --- Schemas ---
class TransactionCreate(BaseModel):
    description: str
    amount: float
    category: Optional[str] = None
    date: datetime
    notes: Optional[str] = None

class TransactionOut(BaseModel):
    id: int
    description: str
    amount: float
    category: str
    is_income: bool
    is_anomaly: bool
    date: datetime
    notes: Optional[str]
    class Config:
        from_attributes = True

# --- Routes ---
@router.post("/", response_model=TransactionOut, status_code=201)
def create_transaction(
    data: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Auto-categorize if not provided
    category = data.category or predict_category(data.description)

    # Get user's transaction history for anomaly detection
    history = db.query(Transaction).filter(Transaction.user_id == current_user.id).all()
    amounts = [t.amount for t in history if t.category == category]
    is_anomaly = detect_anomaly(data.amount, amounts) if len(amounts) >= 5 else False

    tx = Transaction(
        user_id=current_user.id,
        description=data.description,
        amount=data.amount,
        category=category,
        is_income=data.amount > 0,
        is_anomaly=is_anomaly,
        date=data.date,
        notes=data.notes,
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return tx

@router.get("/", response_model=List[TransactionOut])
def list_transactions(
    skip: int = 0,
    limit: int = 50,
    category: Optional[str] = None,
    month: Optional[int] = None,
    year: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Transaction).filter(Transaction.user_id == current_user.id)
    if category:
        query = query.filter(Transaction.category == category)
    if month:
        query = query.filter(extract("month", Transaction.date) == month)
    if year:
        query = query.filter(extract("year", Transaction.date) == year)
    return query.order_by(Transaction.date.desc()).offset(skip).limit(limit).all()

@router.delete("/{tx_id}", status_code=204)
def delete_transaction(
    tx_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    tx = db.query(Transaction).filter(
        Transaction.id == tx_id, Transaction.user_id == current_user.id
    ).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    db.delete(tx)
    db.commit()

@router.post("/upload-csv", response_model=List[TransactionOut])
async def upload_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Upload CSV with columns: date, description, amount
    """
    content = await file.read()
    df = pd.read_csv(io.StringIO(content.decode("utf-8")))

    required_cols = {"date", "description", "amount"}
    if not required_cols.issubset(set(df.columns.str.lower())):
        raise HTTPException(status_code=400, detail=f"CSV must have columns: {required_cols}")

    df.columns = df.columns.str.lower()
    created = []

    for _, row in df.iterrows():
        try:
            category = predict_category(str(row["description"]))
            tx = Transaction(
                user_id=current_user.id,
                description=str(row["description"]),
                amount=float(row["amount"]),
                category=category,
                is_income=float(row["amount"]) > 0,
                is_anomaly=False,
                date=pd.to_datetime(row["date"]),
            )
            db.add(tx)
            created.append(tx)
        except Exception:
            continue

    db.commit()
    for tx in created:
        db.refresh(tx)
    return created

@router.get("/anomalies", response_model=List[TransactionOut])
def get_anomalies(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Transaction)
        .filter(Transaction.user_id == current_user.id, Transaction.is_anomaly == True)
        .order_by(Transaction.date.desc())
        .all()
    )
