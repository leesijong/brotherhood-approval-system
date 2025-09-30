param(
    [Parameter(Mandatory=$true)]
    [string]$Query
)

Write-Host "=== Brotherhood Database Query ===" -ForegroundColor Green
Write-Host "Executing: $Query" -ForegroundColor Cyan
Write-Host ""

& .\scripts\simple-db-query.ps1 $Query