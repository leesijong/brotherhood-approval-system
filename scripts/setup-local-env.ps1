# 로컬 개발 환경 설정 스크립트

Write-Host "=== 한국순교복자수도회 내부결재 시스템 로컬 개발 환경 설정 ===" -ForegroundColor Green
Write-Host ""

# 1. Java 17 설치 확인
Write-Host "1. Java 17 설치 확인 중..." -ForegroundColor Yellow
try {
    $javaVersion = java -version 2>&1 | Select-String "version"
    if ($javaVersion -match "17") {
        Write-Host "✓ Java 17이 설치되어 있습니다." -ForegroundColor Green
    } else {
        Write-Host "✗ Java 17이 설치되어 있지 않습니다." -ForegroundColor Red
        Write-Host "Java 17을 설치하려면 다음 스크립트를 실행하세요:" -ForegroundColor Yellow
        Write-Host ".\scripts\install-java.ps1" -ForegroundColor Cyan
        exit 1
    }
} catch {
    Write-Host "✗ Java가 설치되어 있지 않습니다." -ForegroundColor Red
    Write-Host "Java 17을 설치하려면 다음 스크립트를 실행하세요:" -ForegroundColor Yellow
    Write-Host ".\scripts\install-java.ps1" -ForegroundColor Cyan
    exit 1
}

# 2. PostgreSQL 설치 확인
Write-Host "`n2. PostgreSQL 설치 확인 중..." -ForegroundColor Yellow
try {
    $pgVersion = psql --version 2>&1
    if ($pgVersion -match "psql \(PostgreSQL\) 16") {
        Write-Host "✓ PostgreSQL 16이 설치되어 있습니다." -ForegroundColor Green
    } else {
        Write-Host "✗ PostgreSQL 16이 설치되어 있지 않습니다." -ForegroundColor Red
        Write-Host "PostgreSQL 16을 설치하려면 다음 스크립트를 실행하세요:" -ForegroundColor Yellow
        Write-Host ".\scripts\install-postgresql.ps1" -ForegroundColor Cyan
        exit 1
    }
} catch {
    Write-Host "✗ PostgreSQL이 설치되어 있지 않습니다." -ForegroundColor Red
    Write-Host "PostgreSQL 16을 설치하려면 다음 스크립트를 실행하세요:" -ForegroundColor Yellow
    Write-Host ".\scripts\install-postgresql.ps1" -ForegroundColor Cyan
    exit 1
}

# 3. 데이터베이스 연결 테스트
Write-Host "`n3. 데이터베이스 연결 테스트 중..." -ForegroundColor Yellow
try {
    $env:PATH += ";C:\Program Files\PostgreSQL\16\bin"
    $result = & psql -U approval_user -d approval_system_dev -c "SELECT version();" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ 데이터베이스 연결 성공" -ForegroundColor Green
    } else {
        Write-Host "✗ 데이터베이스 연결 실패" -ForegroundColor Red
        Write-Host "데이터베이스를 생성하려면 다음 스크립트를 실행하세요:" -ForegroundColor Yellow
        Write-Host ".\scripts\install-postgresql.ps1" -ForegroundColor Cyan
        exit 1
    }
} catch {
    Write-Host "✗ 데이터베이스 연결 실패" -ForegroundColor Red
    Write-Host "데이터베이스를 생성하려면 다음 스크립트를 실행하세요:" -ForegroundColor Yellow
    Write-Host ".\scripts\install-postgresql.ps1" -ForegroundColor Cyan
    exit 1
}

# 4. Gradle Wrapper 생성
Write-Host "`n4. Gradle Wrapper 설정 중..." -ForegroundColor Yellow
if (Test-Path "backend\gradlew.bat") {
    Write-Host "✓ Gradle Wrapper가 이미 설정되어 있습니다." -ForegroundColor Green
} else {
    Write-Host "Gradle Wrapper를 생성합니다..." -ForegroundColor Yellow
    # Gradle Wrapper는 Spring Boot 프로젝트 생성 시 자동으로 생성됩니다.
    Write-Host "✓ Gradle Wrapper는 Spring Boot 프로젝트 생성 시 설정됩니다." -ForegroundColor Green
}

# 5. 환경변수 설정
Write-Host "`n5. 환경변수 설정 중..." -ForegroundColor Yellow
$env:SPRING_PROFILES_ACTIVE = "dev"
$env:DB_URL = "jdbc:postgresql://localhost:5432/approval_system_dev"
$env:DB_USERNAME = "approval_user"
$env:DB_PASSWORD = "approval_password"

Write-Host "✓ 환경변수 설정 완료" -ForegroundColor Green
Write-Host "  SPRING_PROFILES_ACTIVE=dev" -ForegroundColor Cyan
Write-Host "  DB_URL=jdbc:postgresql://localhost:5432/approval_system_dev" -ForegroundColor Cyan
Write-Host "  DB_USERNAME=approval_user" -ForegroundColor Cyan
Write-Host "  DB_PASSWORD=approval_password" -ForegroundColor Cyan

# 6. 프로젝트 디렉토리 구조 확인
Write-Host "`n6. 프로젝트 디렉토리 구조 확인 중..." -ForegroundColor Yellow
$requiredDirs = @("backend", "frontend", "db", "scripts", "config\local")
$allDirsExist = $true

foreach ($dir in $requiredDirs) {
    if (Test-Path $dir) {
        Write-Host "✓ $dir 디렉토리 존재" -ForegroundColor Green
    } else {
        Write-Host "✗ $dir 디렉토리 없음" -ForegroundColor Red
        $allDirsExist = $false
    }
}

if ($allDirsExist) {
    Write-Host "✓ 모든 필수 디렉토리가 존재합니다." -ForegroundColor Green
} else {
    Write-Host "✗ 일부 디렉토리가 누락되었습니다." -ForegroundColor Red
    exit 1
}

Write-Host "`n=== 로컬 개발 환경 설정 완료 ===" -ForegroundColor Green
Write-Host "이제 다음 단계를 진행할 수 있습니다:" -ForegroundColor Yellow
Write-Host "1. Spring Boot 프로젝트 생성" -ForegroundColor Cyan
Write-Host "2. 데이터베이스 스키마 생성" -ForegroundColor Cyan
Write-Host "3. 백엔드 애플리케이션 개발" -ForegroundColor Cyan
Write-Host "4. 프론트엔드 개발" -ForegroundColor Cyan
