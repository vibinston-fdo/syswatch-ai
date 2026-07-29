# ╔══════════════════════════════════════════════════════════════╗
# ║         SysWatch AI — Metrics Simulator Launcher             ║
# ║    Sends live CPU / Memory / Latency data to the backend     ║
# ╚══════════════════════════════════════════════════════════════╝

$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendDir  = Join-Path $ProjectRoot "backend"
$PythonExe   = Join-Path $BackendDir "venv\Scripts\python.exe"
$SimScript   = Join-Path $BackendDir "simulator\fake_services.py"

Write-Host ""
Write-Host "  ⚡ SysWatch AI — Simulator" -ForegroundColor Cyan
Write-Host "  Sending metrics to http://localhost:8000 every second" -ForegroundColor DarkGray
Write-Host "  AI anomaly detection fires after 20 data points per service" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  Make sure the main server (start.ps1) is running first!" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Press CTRL+C to stop." -ForegroundColor DarkGray
Write-Host ""

Set-Location $BackendDir
& $PythonExe $SimScript
