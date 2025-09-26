from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import pandas as pd
from app.routes import namaste, icd, mapping, abha
from app.database import engine, SessionLocal
from app import models

# Create all tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="NAMASTE ↔ ICD11 FHIR API")

# Add CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # React dev server URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    """Initialize database with ABHA user data if empty"""
    db = SessionLocal()
    try:
        # Check if users table is empty
        user_count = db.query(models.User).count()
        if user_count == 0:
            # Load ABHA users from CSV
            abha_df = pd.read_csv("app/data/abha_mock_users.csv", dtype={"phone": str})
            
            # Insert users into database
            for _, row in abha_df.iterrows():
                user = models.User(
                    abha_id=row["abha_id"],
                    name=row["name"],
                    email=row["email"],
                    phone=row["phone"],
                    dob=row["dob"],
                    gender=row["gender"],
                    address=row["address"],
                    created_at=row["created_at"]
                )
                db.add(user)
            
            db.commit()
            print("✅ Database initialized with ABHA user data")
        else:
            print("✅ Database already contains user data")
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Welcome to the NAMASTE ↔ ICD11 FHIR API"}

app.include_router(namaste.router, prefix="/namaste", tags=["NAMASTE"])
app.include_router(icd.router, prefix="/icd", tags=["ICD-11"])
app.include_router(mapping.router, prefix="/mapping", tags=["Mapping"])
app.include_router(abha.router, prefix="/abha", tags=["ABHA"])