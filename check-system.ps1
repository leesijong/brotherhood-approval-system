# Brotherhood System Status Check Script
# Status check script to run from project root

Write-Host "=== Brotherhood System Status Check ===" -ForegroundColor Cyan
Write-Host ""

# Check script directory
if (-not (Test-Path "scripts\test-status.ps1")) {
    Write-Host "Script directory not found." -ForegroundColor Red
    Write-Host "Please run from project root directory." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Execute status check script
& ".\scripts\test-status.ps1"
