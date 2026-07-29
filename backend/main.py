# main.py
# Heart of the SysWatch AI backend — FastAPI app + static frontend serving

import sys
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

import os
import asyncio
import json
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from database import engine, Base
import models

# ─── STORE CONNECTED WEBSOCKET CLIENTS ───────────────────────
connected_clients: list[WebSocket] = []


async def broadcast_metrics():
    """Broadcasts live metrics to all connected WebSocket clients every second."""
    while True:
        if connected_clients:
            try:
                from sqlalchemy.orm import Session
                from database import SessionLocal
                from models import Metric, Service, Alert

                db: Session = SessionLocal()

                # Gather latest metric for each service
                services_list = db.query(Service).all()
                metrics = []
                for service in services_list:
                    latest = (
                        db.query(Metric)
                        .filter(Metric.service_id == service.id)
                        .order_by(Metric.timestamp.desc())
                        .first()
                    )
                    if latest:
                        metrics.append({
                            "service_id":   service.id,
                            "service_name": service.name,
                            "status":       service.status,
                            "cpu":          latest.cpu,
                            "memory":       latest.memory,
                            "latency":      latest.latency,
                        })

                # Count active (unresolved) alerts
                active_alerts = db.query(Alert).filter(Alert.resolved == False).count()
                db.close()

                payload = json.dumps({"metrics": metrics, "active_alerts": active_alerts})

                # Broadcast — safely remove disconnected clients
                disconnected = []
                for client in list(connected_clients):
                    try:
                        await client.send_text(payload)
                    except Exception:
                        disconnected.append(client)

                for client in disconnected:
                    try:
                        connected_clients.remove(client)
                    except ValueError:
                        pass

            except Exception as e:
                print(f"[WARN] WebSocket broadcast error: {e}")

        await asyncio.sleep(1)


async def run_simulator_async():
    """Runs the metric simulator in a separate thread so it doesn't block the event loop."""
    import threading

    def _run():
        try:
            # Add backend dir to sys.path so simulator can import ai.detector
            sys.path.insert(0, os.path.dirname(__file__))
            from simulator.fake_services import run_simulator
            run_simulator()
        except Exception as e:
            print(f"[WARN] Simulator error: {e}")

    thread = threading.Thread(target=_run, daemon=True, name="syswatch-simulator")
    thread.start()
    print("[OK] Simulator started in background thread")


# ─── LIFESPAN (replaces deprecated @app.on_event) ────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── STARTUP ──
    # 1. Create all database tables if they don't exist
    Base.metadata.create_all(bind=engine)
    print("[OK] Database tables ready!")

    # 2. Start the live metrics broadcaster
    asyncio.create_task(broadcast_metrics())
    print("[OK] WebSocket broadcaster started!")

    # 3. Auto-start the simulator (runs services that push metrics to the DB)
    await run_simulator_async()

    print("[OK] SysWatch AI backend is live!")
    print("[>>] Open http://localhost:8000 in your browser")

    yield  # Application runs here

    # ── SHUTDOWN ──
    print("[--] SysWatch AI shutting down...")


# ─── CREATE FASTAPI APP ───────────────────────────────────────
app = FastAPI(
    title="SysWatch AI",
    description="Real-time distributed system monitor with AI anomaly detection",
    version="1.0.0",
    lifespan=lifespan,
)

# ─── CORS MIDDLEWARE ──────────────────────────────────────────
# Allow both local dev (port 3000) and same-origin production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── IMPORT ROUTES ────────────────────────────────────────────
from routes import auth, services, alerts

app.include_router(auth.router,     prefix="/api/auth",     tags=["Auth"])
app.include_router(services.router, prefix="/api/services", tags=["Services"])
app.include_router(alerts.router,   prefix="/api/alerts",   tags=["Alerts"])


# ─── WEBSOCKET ────────────────────────────────────────────────
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_clients.append(websocket)
    try:
        while True:
            # Keep the connection alive by waiting for any message
            await websocket.receive_text()
    except (WebSocketDisconnect, Exception):
        pass
    finally:
        try:
            connected_clients.remove(websocket)
        except ValueError:
            pass


# ─── API HEALTH CHECK ─────────────────────────────────────────
@app.get("/api/health", tags=["Health"])
async def health():
    return {"status": "ok", "message": "SysWatch AI is running"}


# ─── SERVE REACT FRONTEND (static build) ─────────────────────
# The React build directory lives one level up from this file
FRONTEND_BUILD = os.path.normpath(
    os.path.join(os.path.dirname(__file__), "..", "frontend", "build")
)

if os.path.isdir(FRONTEND_BUILD):
    # Serve static assets (JS, CSS, images, etc.)
    static_dir = os.path.join(FRONTEND_BUILD, "static")
    if os.path.isdir(static_dir):
        app.mount("/static", StaticFiles(directory=static_dir), name="static")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_react(full_path: str):
        """Serve the React SPA — return index.html for any non-API path."""
        # Serve actual files that exist (images, icons, etc.)
        requested = os.path.join(FRONTEND_BUILD, full_path)
        if os.path.isfile(requested):
            return FileResponse(requested)
        # Fallback: always return index.html (SPA routing)
        index_file = os.path.join(FRONTEND_BUILD, "index.html")
        return FileResponse(index_file)
else:
    @app.get("/", tags=["Root"])
    async def root():
        return {
            "message": "SysWatch AI is running!",
            "note": "Frontend build not found. Run 'npm run build' in the frontend directory.",
            "docs": "Visit http://localhost:8000/docs to see all APIs",
        }