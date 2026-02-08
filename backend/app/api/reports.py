from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from app.models.base import get_db
from app.models.models import QualityReport, ReportType
from app.schemas.ai import ReportFinalizationRequest
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

class ReportSummary(BaseModel):
    id: int
    title: str
    status: str
    created_at: datetime
    problem_description: Optional[str] = None

    class Config:
        from_attributes = True

@router.get("/reports", response_model=List[ReportSummary])
async def list_reports(search: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    query = select(QualityReport).order_by(desc(QualityReport.created_at))
    
    if search:
        query = query.where(QualityReport.title.contains(search) | QualityReport.data['problem_description'].astext.contains(search))
    
    result = await db.execute(query)
    reports = result.scalars().all()
    
    # Map to summary (extract description from JSONB if needed)
    summaries = []
    for r in reports:
        desc = r.data.get("problem_description", "") if r.data else ""
        summaries.append(ReportSummary(
            id=r.id,
            title=r.title,
            status=r.status,
            created_at=r.created_at,
            problem_description=desc
        ))
        
    return summaries

@router.get("/reports/{report_id}")
async def get_report(report_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(QualityReport).where(QualityReport.id == report_id))
    report = result.scalar_one_or_none()
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    # Construct response matching EightDGenerationResponse structure
    return {
        "report_id": report.id,
        "problem_description": report.data.get("problem_description", ""),
        "d3_interim_actions": report.data.get("d3_interim_actions", []),
        "d4_root_causes": report.data.get("d4_root_causes", []),
        "d4_occurrence_causes": report.data.get("d4_occurrence_causes", []),
        "d4_escape_causes": report.data.get("d4_escape_causes", []),
        "d4_fishbone": report.data.get("d4_fishbone", {})
    }

@router.put("/reports/{report_id}/finalize")
async def finalize_report(report_id: int, request: ReportFinalizationRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(QualityReport).where(QualityReport.id == report_id))
    report = result.scalar_one_or_none()
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    if report.status == "finalized":
        raise HTTPException(status_code=400, detail="Report is already finalized")
        
    # Update data with notes
    current_data = dict(report.data)
    current_data["technical_notes"] = request.technical_notes
    
    report.data = current_data
    report.status = "finalized"
    
    db.add(report)
    await db.commit()
    await db.refresh(report)
    
    return {"status": "success", "report_id": report.id}

@router.get("/reports/stats")
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)):
    # Simple stats
    total_result = await db.execute(select(func.count(QualityReport.id)))
    total = total_result.scalar() or 0
    
    open_result = await db.execute(select(func.count(QualityReport.id)).where(QualityReport.status == "draft"))
    open_count = open_result.scalar() or 0
    
    # Mock 'recent insights' for now as we don't have a separate Insights table
    return {
        "total_reports": total,
        "open_issues": open_count,
        "pending_approvals": max(0, open_count - 2) # Mock logic
    }

from app.models.hse import HSEReport
from app.schemas.hse import HSEReportCreate

@router.post("/reports/hse", response_model=dict)
async def create_hse_report(report: HSEReportCreate, db: AsyncSession = Depends(get_db)):
    new_report = HSEReport(
        image_path=report.image_path,
        non_conformities=report.non_conformities,
        user_observations=report.user_observations,
        corrective_actions=report.corrective_actions,
        status=report.status
    )
    db.add(new_report)
    await db.commit()
    await db.refresh(new_report)
    return {"status": "success", "report_id": new_report.id}
