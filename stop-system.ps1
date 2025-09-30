# Brotherhood System Stop Script
# Stop all services script to run from project root

Write-Host "=== Brotherhood System Stop ===" -ForegroundColor Cyan
Write-Host ""

# Check script directory
if (-not (Test-Path "scripts\simple-start.ps1")) {
    Write-Host "Script directory not found." -ForegroundColor Red
    Write-Host "Please run from project root directory." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Stopping all services..." -ForegroundColor Red
Write-Host ""

# Execute stop command
& ".\scripts\simple-start.ps1" stop

Write-Host ""
Write-Host "All services have been stopped." -ForegroundColor Green
