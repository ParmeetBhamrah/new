from fastapi import APIRouter, HTTPException, Depends, Header
import pandas as pd
from jose import jwt
from datetime import datetime, timedelta
from typing import Optional
from app.models import ABHAUser, ABHALogin, ABHALoginResponse, TranslationHistory
import json
import os

router = APIRouter()

# Load ABHA users
# abha_users_df = pd.read_csv("app/data/abha_mock_users.csv")
abha_users_df = pd.read_csv("app/data/abha_mock_users.csv", dtype={"phone": str})


# Secret key for JWT (in production, use environment variable)
SECRET_KEY = "your-secret-key-here"
ALGORITHM = "HS256"

# File to store translation history
HISTORY_FILE = "app/data/translation_history.json"

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
def abha_login(login_data: ABHALogin):
    """Mock ABHA login with ABHA ID and phone verification"""
    print("==== DataFrame Read ====")
    print(abha_users_df.head())
    print(abha_users_df.dtypes)
    # Find user in mock data
    user_row = abha_users_df[
        (abha_users_df["abha_id"] == login_data.abha_id) & 
        (abha_users_df["phone"] == login_data.phone)
    ]
    
    if user_row.empty:
        raise HTTPException(status_code=401, detail="Invalid ABHA ID or phone number")
    
    user_data = user_row.iloc[0].to_dict()
    abha_user = ABHAUser(**user_data)
    
    # Create access token
    access_token = create_access_token(login_data.abha_id)
    
    return ABHALoginResponse(
        message="Login successful",
        abha_user=abha_user,
        access_token=access_token
    )

@router.get("/profile", response_model=ABHAUser)
def get_profile(abha_id: str = Depends(verify_token)):
    """Get ABHA user profile"""
    user_row = abha_users_df[abha_users_df["abha_id"] == abha_id]
    
    if user_row.empty:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_data = user_row.iloc[0].to_dict()
    return ABHAUser(**user_data)

@router.post("/save-translation")
def save_translation_history(
    translation_data: dict,
    abha_id: str = Depends(verify_token)
):
    """Save translation history for authenticated user"""
    
    # Load existing history
    history = []
    if os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, 'r') as f:
            history = json.load(f)
    
    # Create new history entry
    new_entry = {
        "id": f"TRANS_{len(history) + 1:04d}",
        "abha_id": abha_id,
        "source_system": translation_data.get("source_system"),
        "source_code": translation_data.get("source_code"),
        "target_system": translation_data.get("target_system"),
        "target_code": translation_data.get("target_code"),
        "snomed_ct_code": translation_data.get("snomed_ct_code"),
        "loinc_code": translation_data.get("loinc_code"),
        "timestamp": datetime.now().isoformat()
    }
    
    history.append(new_entry)
    
    # Save updated history
    with open(HISTORY_FILE, 'w') as f:
        json.dump(history, f, indent=2)
    
    return {"message": "Translation history saved successfully", "entry_id": new_entry["id"]}

@router.get("/translation-history")
def get_translation_history(abha_id: str = Depends(verify_token)):
    """Get translation history for authenticated user"""
    
    if not os.path.exists(HISTORY_FILE):
        return {"history": []}
    
    with open(HISTORY_FILE, 'r') as f:
        all_history = json.load(f)
    
    # Filter history for current user
    user_history = [h for h in all_history if h["abha_id"] == abha_id]
    
    return {"history": user_history}
