# models.py
# This file defines our database tables as Python classes

from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
from sqlalchemy.sql import func
from database import Base

# ─── TABLE 1: Users ───────────────────────────────────────────
# This table stores all registered users (admins/developers)
class User(Base):
    __tablename__ = "users"         # actual table name in MySQL

    id       = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    email    = Column(String(100), unique=True, nullable=False)
    password = Column(String(200), nullable=False)  # stored as hash
    role     = Column(String(20), default="developer")  # admin or developer
    created_at = Column(DateTime, default=func.now())


# ─── TABLE 2: Services ────────────────────────────────────────
# This table stores all the microservices we are monitoring
class Service(Base):
    __tablename__ = "services"

    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String(100), nullable=False)   # e.g "Payment Service"
    status      = Column(String(20), default="healthy") # healthy/warning/critical
    created_at  = Column(DateTime, default=func.now())


# ─── TABLE 3: Metrics ─────────────────────────────────────────
# This table stores live metrics for every service every second
class Metric(Base):
    __tablename__ = "metrics"

    id          = Column(Integer, primary_key=True, index=True)
    service_id  = Column(Integer, nullable=False)  # which service
    service_name = Column(String(100), nullable=False)
    cpu         = Column(Float, nullable=False)     # CPU usage %
    memory      = Column(Float, nullable=False)     # Memory in MB
    latency     = Column(Float, nullable=False)     # Response time in ms
    timestamp   = Column(DateTime, default=func.now())


# ─── TABLE 4: Alerts ──────────────────────────────────────────
# This table stores all anomaly alerts detected by AI
class Alert(Base):
    __tablename__ = "alerts"

    id           = Column(Integer, primary_key=True, index=True)
    service_name = Column(String(100), nullable=False)
    alert_type   = Column(String(100), nullable=False)  # e.g "CPU Spike"
    description  = Column(String(500), nullable=False)
    severity     = Column(String(20), nullable=False)   # critical/warning
    confidence   = Column(Float, nullable=False)        # AI confidence score
    resolved     = Column(Boolean, default=False)
    fix_suggestion = Column(String(500), nullable=True) # AI fix suggestion
    timestamp    = Column(DateTime, default=func.now())