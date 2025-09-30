# Brotherhood System Quick Start Script (Improved)
# 개선된 메인 시작 스크립트

Write-Host "=== Brotherhood System (Improved) ===" -ForegroundColor Cyan
Write-Host ""

# Check script directory
if (-not (Test-Path "scripts\start-system-improved.ps1")) {
    Write-Host "Script directory not found." -ForegroundColor Red
    Write-Host "Please run from project root directory." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Starting system with improved script..." -ForegroundColor Green
Write-Host ""

# Execute improved start script
& ".\scripts\start-system-improved.ps1" start

Write-Host ""
Write-Host "Start script completed!" -ForegroundColor Green


