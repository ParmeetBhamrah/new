from sqlalchemy import Column, String, Integer, DateTime
from app.database import Base
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# SQLAlchemy ORM models
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    abha_id = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=False)
    dob = Column(String, nullable=False)
    gender = Column(String, nullable=False)
    address = Column(String, nullable=False)
    created_at = Column(String, nullable=False)

class TranslationHistory(Base):
    __tablename__ = "translation_history"

    id = Column(Integer, primary_key=True, index=True)
    abha_id = Column(String, index=True, nullable=False)
    source_system = Column(String, nullable=False)
    source_code = Column(String, nullable=False)
    target_system = Column(String, nullable=False)
    target_code = Column(String, nullable=False)
    snomed_ct_code = Column(String, nullable=False)
    loinc_code = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

# Pydantic models for API serialization and validation
class CodeSystemConcept(BaseModel):
    code: str
    display: str
    definition: Optional[str] = None

class CodeSystem(BaseModel):
    resourceType: str = "CodeSystem"
    id: str
    name: str
    concept: List[CodeSystemConcept]

class ConceptMapMapping(BaseModel):
    source_code: str
    target_code: str
    relationship: str
    snomed_ct_code: str
    loinc_code: str

class ConceptMap(BaseModel):
    resourceType: str = "ConceptMap"
    id: str
    name: str
    mappings: List[ConceptMapMapping]

class ABHAUser(BaseModel):
    abha_id: str
    name: str
    email: str
    phone: str
    dob: str
    gender: str
    address: str
    created_at: str

class ABHALogin(BaseModel):
    abha_id: str
    phone: str

class ABHALoginResponse(BaseModel):
    message: str
    abha_user: Optional[ABHAUser] = None
    access_token: Optional[str] = None

class TranslationHistoryResponse(BaseModel):
    id: int
    abha_id: str
    source_system: str
    source_code: str
    target_system: str
    target_code: str
    snomed_ct_code: str
    loinc_code: str
    timestamp: datetime