# Brotherhood Database Connection Script
# Database connection script to run from project root

Write-Host "=== Brotherhood Database Connection ===" -ForegroundColor Cyan
Write-Host ""

# Check script directory
if (-not (Test-Path "scripts\simple-db.ps1")) {
    Write-Host "Script directory not found." -ForegroundColor Red
    Write-Host "Please run from project root directory." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Execute database connection script
& ".\scripts\simple-db.ps1" connect
