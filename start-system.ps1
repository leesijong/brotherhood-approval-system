# Brotherhood System Quick Start Script
# Main script to run from project root

Write-Host "=== Brotherhood System ===" -ForegroundColor Cyan
Write-Host ""

# Check script directory
if (-not (Test-Path "scripts\simple-start.ps1")) {
    Write-Host "Script directory not found." -ForegroundColor Red
    Write-Host "Please run from project root directory." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Starting system..." -ForegroundColor Green
Write-Host ""

# Execute master control script
& ".\scripts\simple-start.ps1" start
