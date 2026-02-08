from pydantic import BaseModel
from typing import List, Optional, Dict

class EightDGenerationRequest(BaseModel):
    problem_description: str
    industry_context: Optional[str] = "Automotive"
    language: Optional[str] = "en"

class EightDGenerationResponse(BaseModel):
    problem_description: str
    d1_team: List[str]
    d2_problem: str
    d3_interim_actions: List[str]
    d4_root_causes: List[str]
    d4_occurrence_causes: List[str]
    d4_escape_causes: List[str]
    d4_fishbone: Dict[str, List[str]]
    d5_chosen_pca: List[str]
    d6_implemented_pca: List[str]
    d7_prevention: List[str]
    d8_recognition: List[str]
    report_id: int

class ReportFinalizationRequest(BaseModel):
    technical_notes: str

class ErrorResponse(BaseModel):
    detail: str
