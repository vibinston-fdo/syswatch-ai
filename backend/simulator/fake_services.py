# simulator/fake_services.py
# This file simulates 5 fake microservices
# Each service sends CPU, memory, latency data every second
# This makes our dashboard come alive with real data!

import requests
import random
import time
import math
from datetime import datetime
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# ─── BACKEND URL ──────────────────────────────────────────────
import os
BASE_URL = os.getenv("BASE_URL", "https://syswatch-ai-backend-25j3.onrender.com")

# ─── 5 FAKE SERVICES ──────────────────────────────────────────
# Each service has:
# - id: unique number
# - name: display name
# - base_cpu: normal CPU usage
# - base_memory: normal memory usage
# - base_latency: normal response time

SERVICES = [
    {
        "id": 1,
        "name": "Auth Service",
        "base_cpu": 18,
        "base_memory": 312,
        "base_latency": 45
    },
    {
        "id": 2,
        "name": "Payment Service",
        "base_cpu": 35,
        "base_memory": 650,
        "base_latency": 120
    },
    {
        "id": 3,
        "name": "Notification Service",
        "base_cpu": 25,
        "base_memory": 430,
        "base_latency": 80
    },
    {
        "id": 4,
        "name": "User Service",
        "base_cpu": 22,
        "base_memory": 420,
        "base_latency": 60
    },
    {
        "id": 5,
        "name": "DB Service",
        "base_cpu": 31,
        "base_memory": 580,
        "base_latency": 92
    }
]

# ─── ANOMALY SIMULATION ───────────────────────────────────────
# Every 60 seconds we randomly spike one service
# This triggers our AI anomaly detection!

anomaly_counter = 0
current_anomaly_service = None

def should_create_anomaly():
    global anomaly_counter, current_anomaly_service
    anomaly_counter += 1

    # Every 60 seconds → pick a random service to spike
    if anomaly_counter % 60 == 0:
        current_anomaly_service = random.choice(SERVICES)["id"]
        print(f"🚨 Simulating anomaly on service {current_anomaly_service}")

    # Anomaly lasts for 15 seconds
    if anomaly_counter % 60 < 15 and current_anomaly_service:
        return current_anomaly_service

    return None

# ─── GENERATE METRIC ──────────────────────────────────────────
# Generates realistic fake metric for a service
# Adds small random variations to make it look real

def generate_metric(service, anomaly_service_id):

    # Start with base values
    cpu     = service["base_cpu"]
    memory  = service["base_memory"]
    latency = service["base_latency"]

    # Add small random noise to every reading
    # This makes the charts look natural not flat
    cpu     += random.uniform(-5, 5)
    memory  += random.uniform(-30, 30)
    latency += random.uniform(-10, 10)

    # If THIS service is having an anomaly → spike it!
    if anomaly_service_id == service["id"]:
        anomaly_type = random.choice(["cpu", "memory", "latency"])

        if anomaly_type == "cpu":
            cpu = random.uniform(88, 98)  # spike CPU very high
            print(f"   ⚡ CPU spike on {service['name']}: {cpu:.1f}%")

        elif anomaly_type == "memory":
            memory = random.uniform(1500, 2000)  # spike memory
            print(f"   ⚡ Memory spike on {service['name']}: {memory:.0f}MB")

        else:
            latency = random.uniform(800, 1200)  # spike latency
            print(f"   ⚡ Latency spike on {service['name']}: {latency:.0f}ms")

    # Make sure values don't go below 0
    cpu     = max(1, cpu)
    memory  = max(100, memory)
    latency = max(10, latency)

    return {
        "service_id":   service["id"],
        "service_name": service["name"],
        "cpu":          round(cpu, 2),
        "memory":       round(memory, 2),
        "latency":      round(latency, 2)
    }

# ─── REGISTER SERVICES ────────────────────────────────────────
# Creates all 5 services in database when simulator starts

def register_services():
    print("📋 Registering services...")
    for service in SERVICES:
        try:
            requests.post(
                f"{BASE_URL}/api/services/create",
                json={"name": service["name"]}
            )
            print(f"   ✅ {service['name']} registered")
        except:
            print(f"   ❌ Could not register {service['name']}")

# ─── MAIN LOOP ────────────────────────────────────────────────
# This runs forever — sends metrics every second

def run_simulator():
    print("🚀 SysWatch AI Simulator Starting...")
    print("📡 Sending metrics every second...")
    print("🤖 AI anomaly detection will start after 20 data points")
    print("─" * 50)

    # First register all services
    register_services()

    # Import detector here to avoid circular imports
    from ai.detector import add_metric, detect_anomaly

    # Run forever
    while True:
        try:
            # Check if any service should have anomaly
            anomaly_service_id = should_create_anomaly()

            # Loop through all 5 services
            for service in SERVICES:

                # Generate metric for this service
                metric = generate_metric(service, anomaly_service_id)

                # Send metric to FastAPI backend
                requests.post(
                    f"{BASE_URL}/api/services/metric",
                    json=metric
                )

                # Also run AI detection
                anomaly = detect_anomaly(
                    service["name"],
                    metric["cpu"],
                    metric["memory"],
                    metric["latency"]
                )

                # Add to AI history
                add_metric(
                    service["name"],
                    metric["cpu"],
                    metric["memory"],
                    metric["latency"]
                )

                # If AI detected anomaly → save alert
                if anomaly:
                    requests.post(
                        f"{BASE_URL}/api/alerts/create",
                        params=anomaly
                    )
                    print(f"🚨 ANOMALY DETECTED: {anomaly['alert_type']} on {anomaly['service_name']}")

            # Wait 1 second before next reading
            time.sleep(1)

        except Exception as e:
            print(f"❌ Error: {e}")
            print("Retrying in 3 seconds...")
            time.sleep(3)

# ─── RUN ──────────────────────────────────────────────────────
if __name__ == "__main__":
    run_simulator()