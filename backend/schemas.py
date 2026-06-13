# schemas.py
# This file defines the shape of data coming IN and going OUT of our API
# Think of it like a form — it validates data before saving to database

from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# ─── USER SCHEMAS ─────────────────────────────────────────────

# Shape of data when someone REGISTERS
class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: str = "developer"  # default role is developer

# Shape of data when someone LOGS IN
class UserLogin(BaseModel):
    email: str
    password: str

# Shape of data we SEND BACK about a user (never send password!)
class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True  # allows reading from database objects


# ─── SERVICE SCHEMAS ──────────────────────────────────────────

# Shape of data when creating a new service
class ServiceCreate(BaseModel):
    name: str

# Shape of data we send back about a service
class ServiceResponse(BaseModel):
    id: int
    name: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# ─── METRIC SCHEMAS ───────────────────────────────────────────

# Shape of metric data coming from fake services
class MetricCreate(BaseModel):
    service_id: int
    service_name: str
    cpu: float      # CPU usage percentage
    memory: float   # Memory in MB
    latency: float  # Response time in ms

# Shape of metric data we send back
class MetricResponse(BaseModel):
    id: int
    service_name: str
    cpu: float
    memory: float
    latency: float
    timestamp: datetime

    class Config:
        from_attributes = True


# ─── ALERT SCHEMAS ────────────────────────────────────────────

# Shape of alert data
class AlertResponse(BaseModel):
    id: int
    service_name: str
    alert_type: str
    description: str
    severity: str
    confidence: float
    resolved: bool
    fix_suggestion: Optional[str]  # optional — AI may not always have a fix
    timestamp: datetime

    class Config:
        from_attributes = True


# ─── TOKEN SCHEMA ─────────────────────────────────────────────

# Shape of JWT token we send after login
class Token(BaseModel):
    access_token: str
    token_type: str  # always "bearer"