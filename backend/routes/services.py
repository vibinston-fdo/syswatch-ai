# routes/services.py
# This file handles everything related to microservices and their metrics

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Service, Metric
from schemas import ServiceCreate, ServiceResponse, MetricCreate, MetricResponse
from typing import List
from datetime import datetime, timedelta

router = APIRouter()

# ─── CREATE A SERVICE ─────────────────────────────────────────
# POST /api/services/create
# Creates a new service to monitor
# Example: create "Payment Service"

@router.post("/create", response_model=ServiceResponse)
async def create_service(service: ServiceCreate, db: Session = Depends(get_db)):

    # Check if service already exists
    existing = db.query(Service).filter(Service.name == service.name).first()
    if existing:
        return existing  # just return existing one

    # Create new service
    new_service = Service(name=service.name, status="healthy")
    db.add(new_service)
    db.commit()
    db.refresh(new_service)

    return new_service

# ─── GET ALL SERVICES ─────────────────────────────────────────
# GET /api/services/
# Returns list of all services with their current status

@router.get("/", response_model=List[ServiceResponse])
async def get_services(db: Session = Depends(get_db)):
    services = db.query(Service).all()
    return services

# ─── SAVE METRIC ──────────────────────────────────────────────
# POST /api/services/metric
# Fake services send their CPU/memory/latency data here
# This gets called every second by our simulator!

@router.post("/metric")
async def save_metric(metric: MetricCreate, db: Session = Depends(get_db)):

    # Save the metric to database
    new_metric = Metric(
        service_id=metric.service_id,
        service_name=metric.service_name,
        cpu=metric.cpu,
        memory=metric.memory,
        latency=metric.latency,
        timestamp=datetime.utcnow()
    )
    db.add(new_metric)
    db.commit()

    # Update service status based on CPU
    # if CPU > 90% → critical
    # if CPU > 60% → warning
    # else → healthy
    service = db.query(Service).filter(
        Service.id == metric.service_id
    ).first()

    if service:
        if metric.cpu > 90:
            service.status = "critical"
        elif metric.cpu > 60:
            service.status = "warning"
        else:
            service.status = "healthy"
        db.commit()

    return {"message": "Metric saved ✅"}

# ─── GET LATEST METRICS ───────────────────────────────────────
# GET /api/services/metrics/latest
# Returns the latest metric for each service
# Used by dashboard to show current status

@router.get("/metrics/latest")
async def get_latest_metrics(db: Session = Depends(get_db)):

    # Get all service names
    services = db.query(Service).all()
    result = []

    for service in services:
        # Get the most recent metric for this service
        latest = db.query(Metric).filter(
            Metric.service_id == service.id
        ).order_by(Metric.timestamp.desc()).first()

        if latest:
            result.append({
                "service_id":   service.id,
                "service_name": service.name,
                "status":       service.status,
                "cpu":          latest.cpu,
                "memory":       latest.memory,
                "latency":      latest.latency,
                "timestamp":    latest.timestamp
            })

    return result

# ─── GET METRIC HISTORY ───────────────────────────────────────
# GET /api/services/metrics/history/{service_name}
# Returns last 10 minutes of metrics for a service
# Used by live charts on dashboard

@router.get("/metrics/history/{service_name}")
async def get_metric_history(service_name: str, db: Session = Depends(get_db)):

    # Get metrics from last 10 minutes only
    ten_mins_ago = datetime.utcnow() - timedelta(minutes=10)

    metrics = db.query(Metric).filter(
        Metric.service_name == service_name,
        Metric.timestamp >= ten_mins_ago
    ).order_by(Metric.timestamp.asc()).all()

    return metrics