param(
    [Parameter(Mandatory=$true)]
    [string]$Query
)

$psqlPath = "C:\Program Files\PostgreSQL\17\bin\psql.exe"

if (-not (Test-Path $psqlPath)) {
    Write-Error "PostgreSQL psql.exe를 찾을 수 없습니다."
    exit 1
}

Write-Host "=== Database Query ===" -ForegroundColor Green
Write-Host "Query: $Query" -ForegroundColor Cyan
Write-Host ""

$env:PGPASSWORD = "postgres"
& $psqlPath -h localhost -p 5432 -U postgres -d approval_system_dev -c $Query
Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Query completed!" -ForegroundColor Green
