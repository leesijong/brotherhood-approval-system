# PostgreSQL 16 설치 스크립트 (Windows PowerShell)

Write-Host "PostgreSQL 16 설치를 시작합니다..." -ForegroundColor Green

# Chocolatey가 설치되어 있는지 확인
if (Get-Command choco -ErrorAction SilentlyContinue) {
    Write-Host "Chocolatey를 사용하여 PostgreSQL 16을 설치합니다..." -ForegroundColor Yellow
    choco install postgresql16 --params '/Password:postgres' -y
} else {
    Write-Host "Chocolatey가 설치되어 있지 않습니다." -ForegroundColor Red
    Write-Host "다음 방법 중 하나를 선택하세요:" -ForegroundColor Yellow
    Write-Host "1. Chocolatey 설치: https://chocolatey.org/install" -ForegroundColor Cyan
    Write-Host "2. 수동 설치: https://www.postgresql.org/download/windows/" -ForegroundColor Cyan
    Write-Host "3. 이 스크립트를 실행하여 자동 설치를 시도합니다." -ForegroundColor Cyan
    
    # 자동 설치 시도
    try {
        Set-ExecutionPolicy Bypass -Scope Process -Force
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
        iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
        
        Write-Host "Chocolatey 설치 완료. PostgreSQL 16을 설치합니다..." -ForegroundColor Green
        choco install postgresql16 --params '/Password:postgres' -y
    } catch {
        Write-Host "자동 설치에 실패했습니다. 수동으로 설치해주세요." -ForegroundColor Red
        Write-Host "다운로드 링크: https://www.postgresql.org/download/windows/" -ForegroundColor Cyan
    }
}

# PostgreSQL 서비스 시작
Write-Host "`nPostgreSQL 서비스를 시작합니다..." -ForegroundColor Yellow
try {
    Start-Service postgresql-x64-16
    Write-Host "PostgreSQL 서비스가 시작되었습니다." -ForegroundColor Green
} catch {
    Write-Host "PostgreSQL 서비스 시작에 실패했습니다. 수동으로 시작해주세요." -ForegroundColor Red
}

# 데이터베이스 생성
Write-Host "`n개발용 데이터베이스를 생성합니다..." -ForegroundColor Yellow
try {
    $env:PATH += ";C:\Program Files\PostgreSQL\16\bin"
    & psql -U postgres -c "CREATE DATABASE approval_system_dev;"
    & psql -U postgres -c "CREATE USER approval_user WITH PASSWORD 'approval_password';"
    & psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE approval_system_dev TO approval_user;"
    Write-Host "데이터베이스 생성 완료" -ForegroundColor Green
} catch {
    Write-Host "데이터베이스 생성에 실패했습니다. 수동으로 생성해주세요." -ForegroundColor Red
    Write-Host "다음 명령어를 실행하세요:" -ForegroundColor Yellow
    Write-Host "psql -U postgres" -ForegroundColor Cyan
    Write-Host "CREATE DATABASE approval_system_dev;" -ForegroundColor Cyan
    Write-Host "CREATE USER approval_user WITH PASSWORD 'approval_password';" -ForegroundColor Cyan
    Write-Host "GRANT ALL PRIVILEGES ON DATABASE approval_system_dev TO approval_user;" -ForegroundColor Cyan
}

Write-Host "`n설치 완료!" -ForegroundColor Green
Write-Host "데이터베이스 연결 정보:" -ForegroundColor Yellow
Write-Host "Host: localhost" -ForegroundColor Cyan
Write-Host "Port: 5432" -ForegroundColor Cyan
Write-Host "Database: approval_system_dev" -ForegroundColor Cyan
Write-Host "Username: approval_user" -ForegroundColor Cyan
Write-Host "Password: approval_password" -ForegroundColor Cyan
