# simulator/fake_services.py
# Simulates 5 fake microservices — each sends CPU, memory, latency data every second.
# This populates the dashboard with live data and triggers AI anomaly detection.

import sys
import os

sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

import requests
import random
import time

# Add project root to sys.path so ai.detector can be imported
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

BASE_URL = os.getenv("BASE_URL", "http://localhost:8000")

# ─── 5 FAKE SERVICES ─────────────────────────────────────────
SERVICES = [
    {"id": 1, "name": "Auth Service",         "base_cpu": 18,  "base_memory": 312, "base_latency": 45},
    {"id": 2, "name": "Payment Service",      "base_cpu": 35,  "base_memory": 650, "base_latency": 120},
    {"id": 3, "name": "Notification Service", "base_cpu": 25,  "base_memory": 430, "base_latency": 80},
    {"id": 4, "name": "User Service",         "base_cpu": 22,  "base_memory": 420, "base_latency": 60},
    {"id": 5, "name": "DB Service",           "base_cpu": 31,  "base_memory": 580, "base_latency": 92},
]

# ─── ANOMALY SCHEDULING ──────────────────────────────────────
# Every 60 seconds a random service gets a metric spike for 15 seconds.
anomaly_counter = 0
current_anomaly_service = None

def should_create_anomaly():
    global anomaly_counter, current_anomaly_service
    anomaly_counter += 1

    # Pick a new service to spike every 60 seconds
    if anomaly_counter % 60 == 0:
        current_anomaly_service = random.choice(SERVICES)["id"]
        print(f"[SIM] Simulating anomaly on service id={current_anomaly_service}")

    # Anomaly lasts 15 ticks
    if anomaly_counter % 60 < 15 and current_anomaly_service:
        return current_anomaly_service
    return None

# ─── METRIC GENERATION ───────────────────────────────────────
def generate_metric(service: dict, anomaly_service_id) -> dict:
    cpu     = service["base_cpu"]     + random.uniform(-5, 5)
    memory  = service["base_memory"]  + random.uniform(-30, 30)
    latency = service["base_latency"] + random.uniform(-10, 10)

    # If this service is the anomaly target — spike one metric
    if anomaly_service_id == service["id"]:
        anomaly_type = random.choice(["cpu", "memory", "latency"])
        if anomaly_type == "cpu":
            cpu = random.uniform(88, 98)
            print(f"   [SPIKE] CPU spike on {service['name']}: {cpu:.1f}%")
        elif anomaly_type == "memory":
            memory = random.uniform(1500, 2000)
            print(f"   [SPIKE] Memory spike on {service['name']}: {memory:.0f}MB")
        else:
            latency = random.uniform(800, 1200)
            print(f"   [SPIKE] Latency spike on {service['name']}: {latency:.0f}ms")

    return {
        "service_id":   service["id"],
        "service_name": service["name"],
        "cpu":          round(max(1.0, cpu),      2),
        "memory":       round(max(100.0, memory), 2),
        "latency":      round(max(10.0, latency), 2),
    }

# ─── REGISTER SERVICES AT STARTUP ────────────────────────────
def register_services():
    print("[SIM] Registering services with backend...")
    for service in SERVICES:
        for attempt in range(5):
            try:
                requests.post(
                    f"{BASE_URL}/api/services/create",
                    json={"name": service["name"]},
                    timeout=3,
                )
                print(f"   [OK] {service['name']} registered")
                break
            except Exception:
                time.sleep(1)  # backend may still be starting up
        else:
            print(f"   [WARN] Could not register {service['name']}")

# ─── MAIN LOOP ───────────────────────────────────────────────
def run_simulator():
    print("[SIM] SysWatch AI Simulator Starting...")
    print(f"[SIM] Pushing metrics to {BASE_URL} every second")
    print("-" * 50)

    # Wait briefly for the backend to fully start (especially when auto-launched)
    time.sleep(3)

    register_services()

    from ai.detector import add_metric, detect_anomaly

    print("[SIM] Running — metrics will appear on dashboard momentarily")

    while True:
        try:
            anomaly_service_id = should_create_anomaly()

            for service in SERVICES:
                metric = generate_metric(service, anomaly_service_id)

                # ── Send metric to backend ──────────────────
                try:
                    requests.post(
                        f"{BASE_URL}/api/services/metric",
                        json=metric,
                        timeout=3,
                    )
                except Exception as e:
                    print(f"[WARN] Could not push metric for {service['name']}: {e}")
                    continue

                # ── Run AI anomaly detection ────────────────
                anomaly = detect_anomaly(
                    service["name"],
                    metric["cpu"],
                    metric["memory"],
                    metric["latency"],
                )

                add_metric(
                    service["name"],
                    metric["cpu"],
                    metric["memory"],
                    metric["latency"],
                )

                # ── Save alert if anomaly found ─────────────
                if anomaly:
                    try:
                        requests.post(
                            f"{BASE_URL}/api/alerts/create",
                            json=anomaly,          # POST JSON body (fixed from params=)
                            timeout=3,
                        )
                        print(f"[ALERT] {anomaly['alert_type']} on {anomaly['service_name']}")
                    except Exception as e:
                        print(f"[WARN] Could not save alert: {e}")

            time.sleep(1)

        except Exception as e:
            print(f"[ERR] Simulator error: {e}")
            print("[SIM] Retrying in 3 seconds...")
            time.sleep(3)


if __name__ == "__main__":
    run_simulator()