# Brotherhood System Status Check
Write-Host "=== Brotherhood System Status Check ===" -ForegroundColor Cyan
Write-Host ""

$projectRoot = "C:\cckbm"
$backendPath = "$projectRoot\backend"
$frontendPath = "$projectRoot\brotherhood"

Write-Host "Project Structure Check:" -ForegroundColor Blue
if (Test-Path $projectRoot) {
    Write-Host "  ✓ Project Root: Exists" -ForegroundColor Green
} else {
    Write-Host "  ✗ Project Root: Not Found" -ForegroundColor Red
}

if (Test-Path $backendPath) {
    Write-Host "  ✓ Backend Directory: Exists" -ForegroundColor Green
} else {
    Write-Host "  ✗ Backend Directory: Not Found" -ForegroundColor Red
}

if (Test-Path $frontendPath) {
    Write-Host "  ✓ Frontend Directory: Exists" -ForegroundColor Green
} else {
    Write-Host "  ✗ Frontend Directory: Not Found" -ForegroundColor Red
}

Write-Host ""
Write-Host "Service Status Check:" -ForegroundColor Blue

# Backend status
try {
    $backendResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/health" -Method Get -TimeoutSec 3
    Write-Host "  ✓ Backend: Running (Port 8080)" -ForegroundColor Green
    Write-Host "     URL: http://localhost:8080" -ForegroundColor Cyan
} catch {
    Write-Host "  ✗ Backend: Not running (Port 8080)" -ForegroundColor Red
}

# Frontend status
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3000" -Method Get -TimeoutSec 3
    Write-Host "  ✓ Frontend: Running (Port 3000)" -ForegroundColor Green
    Write-Host "     URL: http://localhost:3000" -ForegroundColor Cyan
} catch {
    Write-Host "  ✗ Frontend: Not running (Port 3000)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Running Processes:" -ForegroundColor Blue

$javaProcesses = Get-Process | Where-Object { $_.ProcessName -like "*java*" }
if ($javaProcesses) {
    Write-Host "  ✓ Java Processes: $($javaProcesses.Count) running" -ForegroundColor Green
} else {
    Write-Host "  ✗ Java Processes: None running" -ForegroundColor Red
}

$nodeProcesses = Get-Process | Where-Object { $_.ProcessName -like "*node*" }
if ($nodeProcesses) {
    Write-Host "  ✓ Node.js Processes: $($nodeProcesses.Count) running" -ForegroundColor Green
} else {
    Write-Host "  ✗ Node.js Processes: None running" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Status Check Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "Quick Commands:" -ForegroundColor Yellow
Write-Host "  .\scripts\simple-start.ps1 start   # Start entire system" -ForegroundColor Cyan
Write-Host "  .\scripts\simple-start.ps1 stop    # Stop all services" -ForegroundColor Cyan
