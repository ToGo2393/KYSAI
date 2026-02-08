from pydantic import BaseModel
from typing import List, Optional

class HSEAnalysisResponse(BaseModel):
    non_conformities: List[str]
    corrective_actions: List[str]
    image_path: str

class HSEReportCreate(BaseModel):
    image_path: str
    non_conformities: List[str]
    user_observations: Optional[str] = ""
    corrective_actions: List[str]
    status: str = "draft"
