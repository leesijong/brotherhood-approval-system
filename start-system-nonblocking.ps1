# Brotherhood System Quick Start Script (Non-Blocking)
# 완전히 비대기 스크립트 - 대기 문제 완전 해결

Write-Host "=== Brotherhood System (Non-Blocking) ===" -ForegroundColor Cyan
Write-Host ""

# Check script directory
if (-not (Test-Path "scripts\start-system-nonblocking.ps1")) {
    Write-Host "Script directory not found." -ForegroundColor Red
    Write-Host "Please run from project root directory." -ForegroundColor Yellow
    exit 1
}

Write-Host "Starting system with non-blocking script..." -ForegroundColor Green
Write-Host ""

# Execute non-blocking start script
& ".\scripts\start-system-nonblocking.ps1" start

Write-Host ""
Write-Host "Start script completed!" -ForegroundColor Green

