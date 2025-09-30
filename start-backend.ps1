# 백엔드 실행 스크립트
# 사용법: .\start-backend.ps1

Write-Host "🚀 Brotherhood Approval System - 백엔드 시작" -ForegroundColor Green
Write-Host ""

# 현재 디렉토리 확인
$currentDir = Get-Location
Write-Host "현재 디렉토리: $currentDir" -ForegroundColor Yellow

# 올바른 디렉토리로 이동
$backendDir = "C:\cckbm\backend"
if (Test-Path $backendDir) {
    Set-Location $backendDir
    Write-Host "✅ 백엔드 디렉토리로 이동: $backendDir" -ForegroundColor Green
} else {
    Write-Host "❌ 백엔드 디렉토리를 찾을 수 없습니다: $backendDir" -ForegroundColor Red
    exit 1
}

# Gradle 실행
Write-Host ""
Write-Host "🔧 Gradle bootRun 실행 중..." -ForegroundColor Cyan
Write-Host ""

try {
    .\gradlew bootRun
} catch {
    Write-Host "❌ 백엔드 실행 중 오류 발생: $_" -ForegroundColor Red
    exit 1
}
