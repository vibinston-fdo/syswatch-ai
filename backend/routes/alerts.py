# routes/alerts.py
# This file handles everything related to AI anomaly alerts

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Alert
from schemas import AlertResponse
from typing import List

router = APIRouter()

# ─── GET ALL ALERTS ───────────────────────────────────────────
# GET /api/alerts/
# Returns all alerts sorted by newest first
# Used by alerts page on dashboard

@router.get("/", response_model=List[AlertResponse])
async def get_alerts(db: Session = Depends(get_db)):
    alerts = db.query(Alert).order_by(
        Alert.timestamp.desc()  # newest first
    ).all()
    return alerts

# ─── GET ACTIVE ALERTS ────────────────────────────────────────
# GET /api/alerts/active
# Returns only unresolved alerts
# Used by navbar to show alert count badge

@router.get("/active", response_model=List[AlertResponse])
async def get_active_alerts(db: Session = Depends(get_db)):
    alerts = db.query(Alert).filter(
        Alert.resolved == False  # only unresolved
    ).order_by(Alert.timestamp.desc()).all()
    return alerts

# ─── RESOLVE AN ALERT ─────────────────────────────────────────
# PUT /api/alerts/resolve/{alert_id}
# Marks an alert as resolved
# Called when engineer clicks "Mark Resolved" button

@router.put("/resolve/{alert_id}")
async def resolve_alert(alert_id: int, db: Session = Depends(get_db)):

    # Find the alert
    alert = db.query(Alert).filter(Alert.id == alert_id).first()

    if not alert:
        return {"message": "Alert not found!"}

    # Mark as resolved
    alert.resolved = True
    db.commit()

    return {"message": f"Alert {alert_id} resolved ✅"}

# ─── GET ALERT STATS ──────────────────────────────────────────
# GET /api/alerts/stats
# Returns summary numbers for analytics page
# Total alerts, active alerts, most affected service

@router.get("/stats")
async def get_alert_stats(db: Session = Depends(get_db)):

    # Total alerts ever
    total = db.query(Alert).count()

    # Active (unresolved) alerts
    active = db.query(Alert).filter(
        Alert.resolved == False
    ).count()

    # Count alerts per service
    all_alerts = db.query(Alert).all()

    service_counts = {}
    for alert in all_alerts:
        name = alert.service_name
        service_counts[name] = service_counts.get(name, 0) + 1

    # Find most affected service
    most_affected = None
    if service_counts:
        most_affected = max(service_counts, key=service_counts.get)

    return {
        "total_alerts":    total,
        "active_alerts":   active,
        "resolved_alerts": total - active,
        "most_affected":   most_affected,
        "by_service":      service_counts
    }

# ─── CREATE ALERT (used by AI detector) ──────────────────────
# POST /api/alerts/create
# AI detector calls this when it finds an anomaly
# Not called by frontend — only by our AI system internally

@router.post("/create")
async def create_alert(
    service_name: str,
    alert_type: str,
    description: str,
    severity: str,
    confidence: float,
    fix_suggestion: str,
    db: Session = Depends(get_db)
):
    new_alert = Alert(
        service_name=service_name,
        alert_type=alert_type,
        description=description,
        severity=severity,
        confidence=confidence,
        fix_suggestion=fix_suggestion
    )
    db.add(new_alert)
    db.commit()
    db.refresh(new_alert)

    return {"message": "Alert created ✅", "alert_id": new_alert.id}