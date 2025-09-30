# 프론트엔드 실행 스크립트
# 사용법: .\start-frontend.ps1

Write-Host "🚀 Brotherhood Approval System - 프론트엔드 시작" -ForegroundColor Green
Write-Host ""

# 현재 디렉토리 확인
$currentDir = Get-Location
Write-Host "현재 디렉토리: $currentDir" -ForegroundColor Yellow

# 올바른 디렉토리로 이동
$frontendDir = "C:\cckbm\brotherhood"
if (Test-Path $frontendDir) {
    Set-Location $frontendDir
    Write-Host "✅ 프론트엔드 디렉토리로 이동: $frontendDir" -ForegroundColor Green
} else {
    Write-Host "❌ 프론트엔드 디렉토리를 찾을 수 없습니다: $frontendDir" -ForegroundColor Red
    exit 1
}

# npm 실행
Write-Host ""
Write-Host "🔧 npm run dev 실행 중..." -ForegroundColor Cyan
Write-Host ""

try {
    npm run dev
} catch {
    Write-Host "❌ 프론트엔드 실행 중 오류 발생: $_" -ForegroundColor Red
    exit 1
}
