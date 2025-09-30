# Brotherhood System Stop Script (Non-Blocking)
# 완전히 비대기 스크립트 - 대기 문제 완전 해결

Write-Host "=== Brotherhood System Stop (Non-Blocking) ===" -ForegroundColor Cyan
Write-Host ""

# Check script directory
if (-not (Test-Path "scripts\stop-system-nonblocking.ps1")) {
    Write-Host "Script directory not found." -ForegroundColor Red
    Write-Host "Please run from project root directory." -ForegroundColor Yellow
    exit 1
}

Write-Host "Stopping all services with non-blocking script..." -ForegroundColor Red
Write-Host ""

# Execute non-blocking stop script
& ".\scripts\stop-system-nonblocking.ps1"

Write-Host ""
Write-Host "Stop script completed!" -ForegroundColor Green

