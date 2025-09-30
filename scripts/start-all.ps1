# 전체 시스템 시작 스크립트
# 백엔드와 프론트엔드를 순차적으로 시작합니다

param(
    [switch]$SkipBuild = $false,
    [int]$BackendWaitTime = 15
)

# 색상 정의
$Green = "Green"
$Red = "Red"
$Yellow = "Yellow"
$Blue = "Blue"
$Cyan = "Cyan"

Write-Host "=== Brotherhood 결재 시스템 전체 시작 ===" -ForegroundColor $Cyan
Write-Host ""

# 백엔드 시작
Write-Host "1단계: 백엔드 시작" -ForegroundColor $Blue
$backendScript = ".\scripts\start-backend.ps1"
if ($SkipBuild) {
    & $backendScript -Build:$false
} else {
    & $backendScript
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 백엔드 시작 실패!" -ForegroundColor $Red
    Read-Host "Enter 키를 눌러 종료하세요"
    exit 1
}

# 백엔드 시작 대기
Write-Host ""
Write-Host "백엔드 시작 후 $BackendWaitTime 초 대기 중..." -ForegroundColor $Yellow
Start-Sleep -Seconds $BackendWaitTime

# 백엔드 상태 확인
Write-Host "백엔드 상태 확인 중..." -ForegroundColor $Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/health" -Method Get -TimeoutSec 5
    Write-Host "✅ 백엔드 정상 실행 중" -ForegroundColor $Green
} catch {
    Write-Host "⚠️ 백엔드 상태 확인 실패 (계속 진행)" -ForegroundColor $Yellow
}

# 프론트엔드 시작
Write-Host ""
Write-Host "2단계: 프론트엔드 시작" -ForegroundColor $Blue
$frontendScript = ".\scripts\start-frontend.ps1"
& $frontendScript

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 프론트엔드 시작 실패!" -ForegroundColor $Red
    Read-Host "Enter 키를 눌러 종료하세요"
    exit 1
}

Write-Host ""
Write-Host "=== 전체 시스템 시작 완료 ===" -ForegroundColor $Green
Write-Host "백엔드: http://localhost:8080" -ForegroundColor $Cyan
Write-Host "프론트엔드: http://localhost:3000" -ForegroundColor $Cyan
Write-Host "Swagger UI: http://localhost:8080/swagger-ui.html" -ForegroundColor $Cyan
Write-Host ""
Write-Host "서비스 종료를 원하면 각 터미널에서 Ctrl+C를 누르세요." -ForegroundColor $Yellow
