# PostgreSQL 16 간단 설치 스크립트 (Windows PowerShell)
# 수정일: 2024-09-17

Write-Host "PostgreSQL 16 설치를 시작합니다..." -ForegroundColor Green

# 1. Chocolatey 설치 확인 및 설치
if (-not (Get-Command choco -ErrorAction SilentlyContinue)) {
    Write-Host "Chocolatey를 설치합니다..." -ForegroundColor Yellow
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
}

# 2. PostgreSQL 16 설치
Write-Host "PostgreSQL 16을 설치합니다..." -ForegroundColor Yellow
choco install postgresql16 --params '/Password:postgres' -y

# 3. 서비스 시작
Write-Host "PostgreSQL 서비스를 시작합니다..." -ForegroundColor Yellow
Start-Service postgresql-x64-16

# 4. 데이터베이스 생성
Write-Host "개발용 데이터베이스를 생성합니다..." -ForegroundColor Yellow
$env:PATH += ";C:\Program Files\PostgreSQL\16\bin"

# 데이터베이스 생성 명령어 실행
psql -U postgres -c "CREATE DATABASE approval_system_dev;"
psql -U postgres -c "CREATE USER approval_user WITH PASSWORD 'approval_password';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE approval_system_dev TO approval_user;"

Write-Host "설치 완료!" -ForegroundColor Green
Write-Host "데이터베이스 연결 정보:" -ForegroundColor Yellow
Write-Host "Host: localhost" -ForegroundColor Cyan
Write-Host "Port: 5432" -ForegroundColor Cyan
Write-Host "Database: approval_system_dev" -ForegroundColor Cyan
Write-Host "Username: approval_user" -ForegroundColor Cyan
Write-Host "Password: approval_password" -ForegroundColor Cyan

