# main.py
# This is the HEART of our backend
# This is where FastAPI app is created and everything connects together

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models

# ─── CREATE FASTAPI APP ───────────────────────────────────────
app = FastAPI(
    title="SysWatch AI",
    description="Real-time distributed system monitor with AI anomaly detection",
    version="1.0.0"
)

# ─── CORS MIDDLEWARE ──────────────────────────────────────────
# CORS = Cross Origin Resource Sharing
# This allows our React frontend (port 3000) 
# to talk to our FastAPI backend (port 8000)
# Without this → browser blocks the connection!
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React runs here
    allow_credentials=True,
    allow_methods=["*"],    # allow all methods (GET, POST, etc)
    allow_headers=["*"],    # allow all headers
)

# ─── CREATE DATABASE TABLES ───────────────────────────────────
# This automatically creates all tables in MySQL
# when the server starts — if they don't exist yet
@app.on_event("startup")
async def startup():
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created!")
    print("✅ SysWatch AI backend is running!")

# ─── IMPORT ROUTES ────────────────────────────────────────────
# Routes are like departments in our backend
# Each file handles a different part of the API
from routes import auth, services, alerts

app.include_router(auth.router,     prefix="/api/auth",     tags=["Auth"])
app.include_router(services.router, prefix="/api/services", tags=["Services"])
app.include_router(alerts.router,   prefix="/api/alerts",   tags=["Alerts"])

# ─── ROOT ROUTE ───────────────────────────────────────────────
# This is just a test route to check if server is running
@app.get("/")
async def root():
    return {
        "message": "SysWatch AI is running! 🚀",
        "docs": "Visit http://localhost:8000/docs to see all APIs"
    }
from fastapi import WebSocket
import asyncio
import json

# Store connected websocket clients
connected_clients = []

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_clients.append(websocket)
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except:
        connected_clients.remove(websocket)

async def broadcast_metrics():
    while True:
        if connected_clients:
            try:
                from sqlalchemy.orm import Session
                from database import SessionLocal
                from models import Metric, Service, Alert

                db = SessionLocal()

                # Get latest metrics
                services = db.query(Service).all()
                metrics = []
                for service in services:
                    latest = db.query(Metric).filter(
                        Metric.service_id == service.id
                    ).order_by(Metric.timestamp.desc()).first()
                    if latest:
                        metrics.append({
                            "service_id": service.id,
                            "service_name": service.name,
                            "status": service.status,
                            "cpu": latest.cpu,
                            "memory": latest.memory,
                            "latency": latest.latency,
                        })

                # Get active alerts count
                active_alerts = db.query(Alert).filter(
                    Alert.resolved == False
                ).count()

                db.close()

                data = json.dumps({
                    "metrics": metrics,
                    "active_alerts": active_alerts
                })

                # Send to all connected clients
                disconnected = []
                for client in connected_clients:
                    try:
                        await client.send_text(data)
                    except:
                        disconnected.append(client)

                for client in disconnected:
                    connected_clients.remove(client)

            except Exception as e:
                print(f"WebSocket broadcast error: {e}")

        await asyncio.sleep(1)  # broadcast every second

@app.on_event("startup")
async def start_broadcast():
    asyncio.create_task(broadcast_metrics())