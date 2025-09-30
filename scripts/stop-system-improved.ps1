# Brotherhood System Improved Stop Script
# 개선된 시스템 중지 스크립트 - 대기 문제 해결

Write-Host "=== Brotherhood System Improved Stop ===" -ForegroundColor Cyan
Write-Host ""

function Stop-Services {
    Write-Host "Stopping Services..." -ForegroundColor Red
    
    # Java 프로세스 중지
    $javaProcesses = Get-Process | Where-Object { $_.ProcessName -like "*java*" }
    if ($javaProcesses) {
        Write-Host "Found $($javaProcesses.Count) Java processes" -ForegroundColor Yellow
        $javaProcesses | Stop-Process -Force
        Write-Host "Java processes stopped" -ForegroundColor Green
    } else {
        Write-Host "No Java processes found" -ForegroundColor Gray
    }
    
    # Node.js 프로세스 중지
    $nodeProcesses = Get-Process | Where-Object { $_.ProcessName -like "*node*" }
    if ($nodeProcesses) {
        Write-Host "Found $($nodeProcesses.Count) Node.js processes" -ForegroundColor Yellow
        $nodeProcesses | Stop-Process -Force
        Write-Host "Node.js processes stopped" -ForegroundColor Green
    } else {
        Write-Host "No Node.js processes found" -ForegroundColor Gray
    }
    
    # Gradle 프로세스 중지
    $gradleProcesses = Get-Process | Where-Object { $_.ProcessName -like "*gradle*" }
    if ($gradleProcesses) {
        Write-Host "Found $($gradleProcesses.Count) Gradle processes" -ForegroundColor Yellow
        $gradleProcesses | Stop-Process -Force
        Write-Host "Gradle processes stopped" -ForegroundColor Green
    } else {
        Write-Host "No Gradle processes found" -ForegroundColor Gray
    }
    
    Write-Host ""
    Write-Host "All services have been stopped." -ForegroundColor Green
}

# 서비스 중지 실행
Stop-Services

Write-Host ""
Write-Host "Script execution completed!" -ForegroundColor Green


