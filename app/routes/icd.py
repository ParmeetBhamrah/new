from fastapi import APIRouter, Query
import pandas as pd
from app.models import CodeSystem, CodeSystemConcept

router = APIRouter()

icd_df = pd.read_csv("app/data/icd_mock_data.csv")

@router.get("/icd11/tm2/search")
def search_namaste(query: str = Query(..., min_length=1)):
    """Autocomplete search for ICD-11 TM2 terms by code or vice-versa"""
    query_lower = query.lower()
    results = icd_df[icd_df['display'].str.contains(query_lower, case=False, na=False) |
                         icd_df['code'].str.contains(query_lower, case=False, na=False)]
    concepts = [
        CodeSystemConcept(
            code = row['code'],
            display = row['display'],
            definition = row.get('definition', None)
        )
        for _, row, in results.iterrows()
    ]
    return {"resourceType": "CodeSystem", "concepts": concepts}