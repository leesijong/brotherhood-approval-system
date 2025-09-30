# Database Query Execution Script
# Usage: .\scripts\run-db-query.ps1 "SELECT * FROM attachments;"

param(
    [Parameter(Mandatory=$true)]
    [string]$Query
)

# PostgreSQL 경로 찾기
$postgresPaths = @(
    "C:\Program Files\PostgreSQL\17\bin\psql.exe",
    "C:\Program Files\PostgreSQL\16\bin\psql.exe",
    "C:\Program Files\PostgreSQL\15\bin\psql.exe",
    "C:\Program Files\PostgreSQL\14\bin\psql.exe"
)

$psqlPath = $null
foreach ($path in $postgresPaths) {
    if (Test-Path $path) {
        $psqlPath = $path
        break
    }
}

if (-not $psqlPath) {
    Write-Error "PostgreSQL psql.exe를 찾을 수 없습니다."
    exit 1
}

Write-Host "=== Database Query Execution ===" -ForegroundColor Green
Write-Host "PostgreSQL found: $psqlPath" -ForegroundColor Yellow
Write-Host "Database: approval_system_dev" -ForegroundColor Yellow
Write-Host "User: postgres" -ForegroundColor Yellow
Write-Host ""
Write-Host "Executing query: $Query" -ForegroundColor Cyan
Write-Host ""

# 환경 변수 설정
$env:PGPASSWORD = "postgres"

try {
    # 쿼리 실행
    & $psqlPath -h localhost -p 5432 -U postgres -d approval_system_dev -c $Query
}
catch {
    Write-Error "쿼리 실행 중 오류가 발생했습니다: $_"
    exit 1
}
finally {
    # 환경 변수 정리
    Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "Query execution completed!" -ForegroundColor Green