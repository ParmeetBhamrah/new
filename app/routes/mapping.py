from fastapi import APIRouter, Query, Header, Depends, HTTPException
import pandas as pd
from app.models import ConceptMap, ConceptMapMapping
from app.routes.abha import verify_token, save_translation_history
from app.database import get_db
from typing import Optional

router = APIRouter()

# Load the combined mapping CSV (with SNOMED CT and LOINC)
map_df = pd.read_csv("app/data/combined_namaste_icd_snomed_loinc.csv")

@router.get("/translate", response_model=ConceptMap)
def translate_code(
    system: str = Query(..., description="Source system (NAM or TM2)"),
    code: str = Query(..., description="Code to translate"),
    save_history: bool = Query(False, description="Whether to save this lookup to user history"),
    authorization: Optional[str] = Header(None, description="Bearer <token> header"),
    db = Depends(get_db)
):
    """Bidirectional translational system for NAMASTE, ICD11_TM2, SNOMED CT, and LOINC"""
    system = system.upper().strip()
    code = code.strip()

    if system == "NAM":
        matches = map_df[map_df["source_code"] == code]
        source_system = "NAMASTE"
        target_system = "ICD11_TM2"
    elif system == "TM2":
        matches = map_df[map_df["target_code"] == code]
        source_system = "ICD11_TM2"
        target_system = "NAMASTE"
    else:
        raise HTTPException(status_code=400, detail="Unsupported system. Use NAM or TM2.")

    mappings = []
    for _, row in matches.iterrows():
        # Determine source/target for model fields based on original request
        if system == "NAM":
            src_code = row["source_code"]
            tgt_code = row["target_code"]
        else:  # TM2
            src_code = row["target_code"]
            tgt_code = row["source_code"]

        mappings.append(
            ConceptMapMapping(
                source_code=src_code,
                target_code=tgt_code,
                relationship=row["relationship"],
                snomed_ct_code=str(row["snomed_ct_code"]),
                loinc_code=str(row["loinc_code"]),
            )
        )

    result = ConceptMap(
        resourceType="ConceptMap",
        id="ConceptMap",
        name="NAMASTE-ICD11-SNOMED-LOINC Map",
        mappings=mappings
    )

    # Optionally save history if user provided a valid Bearer token
    if save_history and authorization and mappings:
        try:
            abha_id = verify_token(authorization)
            save_translation_history(
                translation_data={
                    "source_system": source_system,
                    "source_code": code,
                    "target_system": target_system,
                    "target_code": mappings[0].target_code,
                    "snomed_ct_code": mappings[0].snomed_ct_code,
                    "loinc_code": mappings[0].loinc_code
                },
                abha_id=abha_id,
                db=db
            )
        except Exception:
            # If token is invalid or saving fails, we ignore to still return the mapping
            pass

    return result