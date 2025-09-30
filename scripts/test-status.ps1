Write-Host "Brotherhood System Status" -ForegroundColor Cyan
Write-Host ""

Write-Host "Project Structure:" -ForegroundColor Blue
if (Test-Path "C:\cckbm") { Write-Host "  Project Root: OK" -ForegroundColor Green }
if (Test-Path "C:\cckbm\backend") { Write-Host "  Backend Directory: OK" -ForegroundColor Green }
if (Test-Path "C:\cckbm\brotherhood") { Write-Host "  Frontend Directory: OK" -ForegroundColor Green }

Write-Host ""
Write-Host "Services:" -ForegroundColor Blue

try {
    Invoke-RestMethod -Uri "http://localhost:8080/api/health" -Method Get -TimeoutSec 2 | Out-Null
    Write-Host "  Backend: Running (8080)" -ForegroundColor Green
} catch {
    Write-Host "  Backend: Not running" -ForegroundColor Red
}

try {
    Invoke-WebRequest -Uri "http://localhost:3000" -Method Get -TimeoutSec 2 | Out-Null
    Write-Host "  Frontend: Running (3000)" -ForegroundColor Green
} catch {
    Write-Host "  Frontend: Not running" -ForegroundColor Red
}

Write-Host ""
Write-Host "Processes:" -ForegroundColor Blue
$javaCount = (Get-Process | Where-Object { $_.ProcessName -like "*java*" }).Count
$nodeCount = (Get-Process | Where-Object { $_.ProcessName -like "*node*" }).Count
Write-Host "  Java: $javaCount processes" -ForegroundColor Cyan
Write-Host "  Node.js: $nodeCount processes" -ForegroundColor Cyan

Write-Host ""
Write-Host "Status Complete" -ForegroundColor Green
