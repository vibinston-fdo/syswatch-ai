# routes/alerts.py
# Handles AI anomaly alert retrieval and management

# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends
# pyrefly: ignore [missing-import]
from pydantic import BaseModel
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
from database import get_db
from models import Alert
from schemas import AlertResponse
from typing import List, Optional

router = APIRouter()

# ─── ALERT CREATE BODY ────────────────────────────────────────
# Proper Pydantic body schema so the AI simulator can POST JSON

class AlertCreate(BaseModel):
    service_name: str
    alert_type: str
    description: str
    severity: str
    confidence: float
    fix_suggestion: Optional[str] = None


# ─── GET ALL ALERTS ───────────────────────────────────────────
# GET /api/alerts/

@router.get("", response_model=List[AlertResponse])
async def get_alerts(db: Session = Depends(get_db)):
    return db.query(Alert).order_by(Alert.timestamp.desc()).all()

# ─── GET ACTIVE ALERTS ────────────────────────────────────────
# GET /api/alerts/active

@router.get("/active", response_model=List[AlertResponse])
async def get_active_alerts(db: Session = Depends(get_db)):
    return (
        db.query(Alert)
        .filter(Alert.resolved == False)
        .order_by(Alert.timestamp.desc())
        .all()
    )

# ─── RESOLVE AN ALERT ─────────────────────────────────────────
# PUT /api/alerts/resolve/{alert_id}

@router.put("/resolve/{alert_id}")
async def resolve_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        return {"message": "Alert not found!"}

    alert.resolved = True
    db.commit()
    return {"message": f"Alert {alert_id} resolved"}

# ─── GET ALERT STATS ──────────────────────────────────────────
# GET /api/alerts/stats

@router.get("/stats")
async def get_alert_stats(db: Session = Depends(get_db)):
    total  = db.query(Alert).count()
    active = db.query(Alert).filter(Alert.resolved == False).count()

    all_alerts = db.query(Alert).all()
    service_counts: dict = {}
    for alert in all_alerts:
        name = alert.service_name
        service_counts[name] = service_counts.get(name, 0) + 1

    most_affected = max(service_counts, key=service_counts.get) if service_counts else None

    return {
        "total_alerts":    total,
        "active_alerts":   active,
        "resolved_alerts": total - active,
        "most_affected":   most_affected,
        "by_service":      service_counts,
    }

# ─── CREATE ALERT ─────────────────────────────────────────────
# POST /api/alerts/create
# Called internally by the AI detector (simulator)

@router.post("/create")
async def create_alert(alert: AlertCreate, db: Session = Depends(get_db)):
    new_alert = Alert(
        service_name=alert.service_name,
        alert_type=alert.alert_type,
        description=alert.description,
        severity=alert.severity,
        confidence=alert.confidence,
        fix_suggestion=alert.fix_suggestion,
    )
    db.add(new_alert)
    db.commit()
    db.refresh(new_alert)
    return {"message": "Alert created", "alert_id": new_alert.id}