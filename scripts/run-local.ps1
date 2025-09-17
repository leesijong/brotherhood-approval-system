# 로컬 개발 환경 실행 스크립트

Write-Host "=== 한국순교복자수도회 내부결재 시스템 로컬 실행 ===" -ForegroundColor Green
Write-Host ""

# 환경변수 설정
Write-Host "환경변수를 설정합니다..." -ForegroundColor Yellow
$env:SPRING_PROFILES_ACTIVE = "dev"
$env:DB_URL = "jdbc:postgresql://localhost:5432/approval_system_dev"
$env:DB_USERNAME = "approval_user"
$env:DB_PASSWORD = "approval_password"
$env:JWT_SECRET = "local-dev-secret-key-change-in-production"
$env:ENCRYPTION_KEY = "local-dev-encryption-key-change-in-production"

Write-Host "✓ 환경변수 설정 완료" -ForegroundColor Green

# PostgreSQL 서비스 확인
Write-Host "`nPostgreSQL 서비스 상태를 확인합니다..." -ForegroundColor Yellow
try {
    $pgService = Get-Service -Name "postgresql-x64-16" -ErrorAction SilentlyContinue
    if ($pgService -and $pgService.Status -eq "Running") {
        Write-Host "✓ PostgreSQL 서비스가 실행 중입니다." -ForegroundColor Green
    } else {
        Write-Host "✗ PostgreSQL 서비스가 실행되지 않았습니다." -ForegroundColor Red
        Write-Host "PostgreSQL 서비스를 시작합니다..." -ForegroundColor Yellow
        Start-Service -Name "postgresql-x64-16"
        Write-Host "✓ PostgreSQL 서비스가 시작되었습니다." -ForegroundColor Green
    }
} catch {
    Write-Host "✗ PostgreSQL 서비스를 찾을 수 없습니다." -ForegroundColor Red
    Write-Host "PostgreSQL을 설치하고 설정해주세요." -ForegroundColor Yellow
    Write-Host "설치 스크립트: .\scripts\install-postgresql.ps1" -ForegroundColor Cyan
    exit 1
}

# 데이터베이스 연결 테스트
Write-Host "`n데이터베이스 연결을 테스트합니다..." -ForegroundColor Yellow
try {
    $env:PATH += ";C:\Program Files\PostgreSQL\16\bin"
    $result = & psql -U approval_user -d approval_system_dev -c "SELECT 1;" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ 데이터베이스 연결 성공" -ForegroundColor Green
    } else {
        Write-Host "✗ 데이터베이스 연결 실패" -ForegroundColor Red
        Write-Host "데이터베이스 설정을 확인해주세요." -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "✗ 데이터베이스 연결 실패" -ForegroundColor Red
    Write-Host "PostgreSQL이 설치되어 있고 실행 중인지 확인해주세요." -ForegroundColor Yellow
    exit 1
}

# Spring Boot 애플리케이션 실행
Write-Host "`nSpring Boot 애플리케이션을 실행합니다..." -ForegroundColor Yellow

if (Test-Path "backend\gradlew.bat") {
    Write-Host "Gradle을 사용하여 애플리케이션을 실행합니다..." -ForegroundColor Yellow
    Set-Location backend
    .\gradlew.bat bootRun
} elseif (Test-Path "backend\target\*.jar") {
    Write-Host "JAR 파일을 사용하여 애플리케이션을 실행합니다..." -ForegroundColor Yellow
    $jarFile = Get-ChildItem -Path "backend\target" -Filter "*.jar" | Where-Object { $_.Name -notlike "*sources*" -and $_.Name -notlike "*javadoc*" } | Select-Object -First 1
    if ($jarFile) {
        java -jar $jarFile.FullName
    } else {
        Write-Host "✗ JAR 파일을 찾을 수 없습니다." -ForegroundColor Red
        Write-Host "먼저 애플리케이션을 빌드해주세요." -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "✗ Spring Boot 프로젝트가 설정되지 않았습니다." -ForegroundColor Red
    Write-Host "먼저 Spring Boot 프로젝트를 생성해주세요." -ForegroundColor Yellow
    Write-Host "다음 단계를 진행하세요:" -ForegroundColor Cyan
    Write-Host "1. Spring Boot 프로젝트 생성" -ForegroundColor Cyan
    Write-Host "2. 데이터베이스 스키마 생성" -ForegroundColor Cyan
    Write-Host "3. 백엔드 애플리케이션 개발" -ForegroundColor Cyan
    exit 1
}

Write-Host "`n=== 애플리케이션 실행 완료 ===" -ForegroundColor Green
Write-Host "웹 애플리케이션: http://localhost:8080" -ForegroundColor Cyan
Write-Host "API 문서: http://localhost:8080/swagger-ui.html" -ForegroundColor Cyan
Write-Host "헬스 체크: http://localhost:8080/actuator/health" -ForegroundColor Cyan
