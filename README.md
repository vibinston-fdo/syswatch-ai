SysWatch AI

A real-time monitoring dashboard that watches CPU, memory, and latency across 5 simulated microservices, and uses an AI anomaly detector (Isolation Forest) to catch spikes and suggest fixes automatically.

Built with FastAPI + React + MySQL.


What it does


Simulates 5 microservices (Auth, Payment, Notification, User, DB) continuously sending metrics
Displays live CPU / memory / latency on a React dashboard with charts
Detects unusual spikes using a machine learning model (Scikit-learn's Isolation Forest) and raises alerts with a severity level and a suggested fix
User accounts with JWT-based login/register
Optional WebSocket endpoint (/ws) for streaming metrics, available on the backend but not yet wired into the frontend UI



Tech stack

LayerTechFrontendReact 19, React Router, Axios, Recharts, Tailwind CSS, Framer MotionBackendFastAPI, SQLAlchemy, PydanticDatabaseMySQL (via PyMySQL)AuthJWT (python-jose) + bcrypt password hashingAIScikit-learn (Isolation Forest anomaly detection)Data simulationA standalone Python script that fakes 5 services sending metrics every second


Project structure

syswatch-ai/
├── backend/
│   ├── main.py              # FastAPI app, CORS, routes, websocket
│   ├── database.py          # SQLAlchemy engine & session (reads DATABASE_URL)
│   ├── models.py            # DB tables: users, services, metrics, alerts
│   ├── schemas.py           # Pydantic request/response schemas
│   ├── requirements.txt
│   ├── routes/
│   │   ├── auth.py          # /api/auth — register, login, me
│   │   ├── services.py      # /api/services — CRUD + metrics
│   │   └── alerts.py        # /api/alerts — anomaly alerts
│   ├── ai/
│   │   └── detector.py      # Isolation Forest anomaly detection logic
│   └── simulator/
│       └── fake_services.py # Sends fake live metrics to the backend
├── frontend/
│   └── src/
│       ├── config.js        # API_URL, reads REACT_APP_API_URL
│       └── pages/           # Login, Register, Dashboard, Services, Alerts, Analytics




Running it locally

1. Database

Create a MySQL database named syswatch (or update the connection string below to match).

2. Backend

bashcd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

Set your database connection (defaults to mysql+pymysql://root:vibin@localhost:3306/syswatch if unset):

bashexport DATABASE_URL="mysql+pymysql://USER:PASSWORD@HOST:PORT/syswatch"
export ALLOWED_ORIGINS="http://localhost:3000"

Run the API:

bashuvicorn main:app --reload

Visit http://localhost:8000/docs for interactive API docs (Swagger UI).

3. Start the fake data simulator (in a second terminal)

The dashboard stays empty until this is running — it's what generates the live metrics:

bashcd backend
python simulator/fake_services.py

4. Frontend (in a third terminal)

bashcd frontend
npm install
npm start

Visit http://localhost:3000.

By default the frontend talks to http://localhost:8000 — to point it elsewhere, set REACT_APP_API_URL in a .env file before running/building.





Known issues / things to fix before production


⚠️ backend/requirements.txt is UTF-16 encoded (likely saved from Windows PowerShell). Most pip install environments expect UTF-8/ASCII and will fail to parse it — re-save it as UTF-8 before deploying.
⚠️ JWT SECRET_KEY is hardcoded in routes/auth.py. Move it to an environment variable before going live, so tokens can't be forged by anyone who reads the source.
The /ws WebSocket endpoint exists on the backend but isn't consumed anywhere in the frontend yet — dashboard currently polls via REST instead.



API overview

EndpointMethodDescription/api/auth/registerPOSTCreate a new user/api/auth/loginPOSTLog in, returns JWT/api/auth/meGETGet current user info/api/services/createPOSTRegister a new service/api/services/GETList all services/api/services/metricPOSTSubmit a metric reading/api/services/metrics/latestGETLatest reading per service/api/services/metrics/history/{service_name}GETLast 10 minutes of readings/api/alerts/GETList all alerts, newest first/api/alerts/activeGETList only unresolved alerts/api/alerts/statsGETSummary counts for the analytics page/api/alerts/createPOSTCreate an alert (used internally by the AI detector)/api/alerts/resolve/{alert_id}PUTMark an alert resolved/wsWebSocketLive metrics stream (not yet used by frontend)
