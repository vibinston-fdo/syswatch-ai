# ai/detector.py
# This is the AI brain of SysWatch
# It uses Isolation Forest to detect anomalies in metrics

import numpy as np
from sklearn.ensemble import IsolationForest
from datetime import datetime

# ─── AI MODEL SETUP ───────────────────────────────────────────
model = IsolationForest(
    contamination=0.1,
    random_state=42
)

# Store recent metrics in memory for each service
metrics_history = {}

# Minimum data points needed before AI starts detecting
MIN_DATA_POINTS = 20

# Track recent alerts to avoid spam
recent_alerts = {}
ALERT_COOLDOWN = 60  # seconds between same alert

# ─── FIX SUGGESTIONS ──────────────────────────────────────────
fix_suggestions = {
    "CPU Spike": [
        "Check for infinite loops in recent code changes",
        "Scale up the service — add more CPU resources",
        "Restart the service to clear any stuck processes",
        "Check if a background job is consuming too much CPU"
    ],
    "Memory Leak": [
        "Restart the service container to free memory",
        "Check recent code for unclosed database connections",
        "Increase memory limit in docker-compose.yml",
        "Profile the application to find memory leak source"
    ],
    "High Latency": [
        "Check database query performance — add indexes",
        "Check network connectivity between services",
        "Review recent API changes that may slow response",
        "Check if database connection pool is exhausted"
    ]
}

# ─── ADD METRIC TO HISTORY ────────────────────────────────────
def add_metric(service_name: str, cpu: float, memory: float, latency: float):
    if service_name not in metrics_history:
        metrics_history[service_name] = []

    metrics_history[service_name].append([cpu, memory, latency])

    # Keep only last 100 data points
    if len(metrics_history[service_name]) > 100:
        metrics_history[service_name].pop(0)

# ─── DETECT ANOMALY ───────────────────────────────────────────
def detect_anomaly(service_name: str, cpu: float, memory: float, latency: float):

    # Not enough data yet
    if service_name not in metrics_history:
        return None
    if len(metrics_history[service_name]) < MIN_DATA_POINTS:
        return None

    history = metrics_history[service_name]
    data = np.array(history)

    # Train model on historical data
    model.fit(data)

    # Check if current reading is anomaly
    current = np.array([[cpu, memory, latency]])
    prediction = model.predict(current)
    score = model.score_samples(current)[0]

    # prediction = -1 means ANOMALY
    if prediction[0] == -1:

        # Figure out type of anomaly
        avg_cpu     = np.mean(data[:, 0])
        avg_memory  = np.mean(data[:, 1])
        avg_latency = np.mean(data[:, 2])

        cpu_diff     = abs(cpu - avg_cpu)
        memory_diff  = abs(memory - avg_memory)
        latency_diff = abs(latency - avg_latency)

        if cpu_diff > memory_diff and cpu_diff > latency_diff:
            alert_type  = "CPU Spike"
            description = f"CPU jumped to {cpu:.1f}% (avg: {avg_cpu:.1f}%)"
            severity    = "critical" if cpu > 90 else "warning"

        elif memory_diff > latency_diff:
            alert_type  = "Memory Leak"
            description = f"Memory at {memory:.0f}MB (avg: {avg_memory:.0f}MB)"
            severity    = "critical" if memory > 1500 else "warning"

        else:
            alert_type  = "High Latency"
            description = f"Latency at {latency:.0f}ms (avg: {avg_latency:.0f}ms)"
            severity    = "warning"

        # Calculate confidence score
        confidence = min(abs(score) * 30, 99)

        # COOLDOWN CHECK
        # Don't spam same alert for same service
        alert_key = f"{service_name}_{alert_type}"
        now = datetime.utcnow()

        if alert_key in recent_alerts:
            last_time = recent_alerts[alert_key]
            diff = (now - last_time).total_seconds()
            if diff < ALERT_COOLDOWN:
                return None  # too soon — skip this alert

        # Record this alert time
        recent_alerts[alert_key] = now

        # Pick a fix suggestion
        import random
        fix = random.choice(fix_suggestions.get(alert_type, ["Investigate the service"]))

        return {
            "service_name":   service_name,
            "alert_type":     alert_type,
            "description":    description,
            "severity":       severity,
            "confidence":     round(confidence, 1),
            "fix_suggestion": fix,
            "timestamp":      datetime.utcnow().isoformat()
        }

    return None