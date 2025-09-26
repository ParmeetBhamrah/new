from fastapi import APIRouter, HTTPException, Depends, Header
from sqlalchemy.orm import Session
import pandas as pd
from jose import jwt
from datetime import datetime, timedelta
from typing import Optional
import os
from app.models import ABHAUser, ABHALogin, ABHALoginResponse, User, TranslationHistory, TranslationHistoryResponse
from app.database import get_db

router = APIRouter()

# Secret key for JWT (load from environment variable)
SECRET_KEY = os.getenv("SECRET_KEY", "a-very-long-and-secure-default-secret-for-dev-only-please-change-in-production")
ALGORITHM = "HS256"

def create_access_token(abha_id: str):
    """Create JWT access token"""
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode = {"abha_id": abha_id, "exp": expire}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(authorization: str = Header(None)):
    """Verify JWT token from header"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        abha_id: str = payload.get("abha_id")
        if abha_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return abha_id
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/login", response_model=ABHALoginResponse)
def abha_login(login_data: ABHALogin, db: Session = Depends(get_db)):
    """ABHA login with ABHA ID and phone verification"""
    # Find user in database
    user = db.query(User).filter(
        User.abha_id == login_data.abha_id,
        User.phone == login_data.phone
    ).first()
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid ABHA ID or phone number")
    
    # Convert SQLAlchemy model to Pydantic model
    abha_user = ABHAUser(
        abha_id=user.abha_id,
        name=user.name,
        email=user.email,
        phone=user.phone,
        dob=user.dob,
        gender=user.gender,
        address=user.address,
        created_at=user.created_at
    )
    
    # Create access token
    access_token = create_access_token(login_data.abha_id)
    
    return ABHALoginResponse(
        message="Login successful",
        abha_user=abha_user,
        access_token=access_token
    )

@router.get("/profile", response_model=ABHAUser)
def get_profile(abha_id: str = Depends(verify_token), db: Session = Depends(get_db)):
    """Get ABHA user profile"""
    user = db.query(User).filter(User.abha_id == abha_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return ABHAUser(
        abha_id=user.abha_id,
        name=user.name,
        email=user.email,
        phone=user.phone,
        dob=user.dob,
        gender=user.gender,
        address=user.address,
        created_at=user.created_at
    )

@router.post("/save-translation")
def save_translation_history(
    translation_data: dict,
    abha_id: str = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """Save translation history for authenticated user"""
    
    # Create new history entry
    new_entry = TranslationHistory(
        abha_id=abha_id,
        source_system=translation_data.get("source_system"),
        source_code=translation_data.get("source_code"),
        target_system=translation_data.get("target_system"),
        target_code=translation_data.get("target_code"),
        snomed_ct_code=translation_data.get("snomed_ct_code"),
        loinc_code=translation_data.get("loinc_code"),
        timestamp=datetime.utcnow()
    )
    
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    
    return {"message": "Translation history saved successfully", "entry_id": new_entry.id}

@router.get("/translation-history")
def get_translation_history(
    abha_id: str = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """Get translation history for authenticated user"""
    
    history = db.query(TranslationHistory).filter(
        TranslationHistory.abha_id == abha_id
    ).order_by(TranslationHistory.timestamp.desc()).all()
    
    return {"history": history}