# Brotherhood System Stop Script (Improved)
# 개선된 메인 중지 스크립트

Write-Host "=== Brotherhood System Stop (Improved) ===" -ForegroundColor Cyan
Write-Host ""

# Check script directory
if (-not (Test-Path "scripts\stop-system-improved.ps1")) {
    Write-Host "Script directory not found." -ForegroundColor Red
    Write-Host "Please run from project root directory." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Stopping all services with improved script..." -ForegroundColor Red
Write-Host ""

# Execute improved stop script
& ".\scripts\stop-system-improved.ps1"

Write-Host ""
Write-Host "Stop script completed!" -ForegroundColor Green


