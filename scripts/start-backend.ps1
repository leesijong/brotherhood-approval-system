# 백엔드 시작 스크립트
# Spring Boot 애플리케이션을 시작합니다

param(
    [switch]$Build = $true,
    [switch]$NoExit
)

# 색상 정의
$Green = "Green"
$Red = "Red"
$Yellow = "Yellow"
$Blue = "Blue"

$backendPath = "C:\cckbm\backend"

Write-Host "=== 백엔드 시작 ===" -ForegroundColor $Blue

# 디렉토리 존재 확인
if (-not (Test-Path $backendPath)) {
    Write-Host "❌ 백엔드 디렉토리를 찾을 수 없습니다: $backendPath" -ForegroundColor $Red
    if (-not $NoExit) {
        Read-Host "Enter 키를 눌러 종료하세요"
        exit 1
    }
    return
}

# 디렉토리 이동
Set-Location $backendPath
Write-Host "백엔드 디렉토리로 이동: $(Get-Location)" -ForegroundColor $Yellow

# 빌드 실행
if ($Build) {
    Write-Host "Gradle 빌드 시작..." -ForegroundColor $Yellow
    .\gradlew clean build -x test
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ 빌드 실패!" -ForegroundColor $Red
        if (-not $NoExit) {
            Read-Host "Enter 키를 눌러 종료하세요"
            exit 1
        }
        return
    }
    
    Write-Host "✅ 빌드 성공!" -ForegroundColor $Green
}

# 애플리케이션 시작
Write-Host "Spring Boot 애플리케이션 시작..." -ForegroundColor $Yellow
Write-Host "백엔드 URL: http://localhost:8080" -ForegroundColor $Cyan
Write-Host "Swagger UI: http://localhost:8080/swagger-ui.html" -ForegroundColor $Cyan
Write-Host ""

.\gradlew bootRun

Write-Host "=== 백엔드 종료 ===" -ForegroundColor $Blue