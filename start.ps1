# SysWatch AI Backend + Frontend Launcher

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendDir  = Join-Path $ProjectRoot "backend"
$PythonExe   = Join-Path $BackendDir "venv\Scripts\python.exe"

Write-Host "SysWatch AI Monitoring Platform" -ForegroundColor Cyan

# Check Python executable
if (-not (Test-Path $PythonExe)) {
    Write-Host "[ERROR] Python venv not found at: $PythonExe" -ForegroundColor Red
    Write-Host "Run: python -m venv backend\venv && backend\venv\Scripts\pip install -r backend\requirements.txt" -ForegroundColor Yellow
    exit 1
}

# Check/create MySQL database
Write-Host "[1/3] Checking MySQL database..." -ForegroundColor Yellow
& $PythonExe -c "
import pymysql, os
db_url = os.getenv('DATABASE_URL', 'mysql+pymysql://root:vibin@localhost:3306/syswatch')
try:
    conn = pymysql.connect(host='localhost', port=3306, user='root', password='vibin')
    cursor = conn.cursor()
    cursor.execute('CREATE DATABASE IF NOT EXISTS syswatch')
    conn.commit()
    conn.close()
    print('  [OK] Database ready')
except Exception as e:
    print(f'  [WARN] DB check failed: {e}')
" 2>&1

# Check React build
$FrontendBuild = Join-Path $ProjectRoot "frontend\build\index.html"
if (-not (Test-Path $FrontendBuild)) {
    Write-Host "[2/3] Building React frontend (first time may take 1-2 min)..." -ForegroundColor Yellow
    Push-Location (Join-Path $ProjectRoot "frontend")
    npm run build
    Pop-Location
} else {
    Write-Host "[2/3] React build found - skipping rebuild." -ForegroundColor Green
}

# Start uvicorn
Write-Host "[3/3] Starting SysWatch AI server..." -ForegroundColor Yellow
Write-Host "  ->  http://localhost:8000" -ForegroundColor Green
Write-Host "  ->  http://localhost:8000/docs  (API docs)" -ForegroundColor Cyan
Write-Host "  ->  http://localhost:8000/api/health" -ForegroundColor DarkGray
Write-Host "Press CTRL+C to stop the server." -ForegroundColor DarkGray

Set-Location $BackendDir
& $PythonExe -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
