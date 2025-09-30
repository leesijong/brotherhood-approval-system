# Brotherhood System Non-Blocking Start Script
# 완전히 비대기 스크립트 - Read-Host 제거

param(
    [string]$Action = "start"
)

Write-Host "=== Brotherhood System Non-Blocking Start ===" -ForegroundColor Cyan
Write-Host "Action: $Action" -ForegroundColor Yellow
Write-Host ""

$projectRoot = "C:\cckbm"
$backendPath = "$projectRoot\backend"
$frontendPath = "$projectRoot\brotherhood"

function Start-Backend {
    Write-Host "Starting Backend..." -ForegroundColor Blue
    
    if (-not (Test-Path $backendPath)) {
        Write-Host "Backend directory not found: $backendPath" -ForegroundColor Red
        return $false
    }
    
    # 백엔드 빌드
    Write-Host "Building backend..." -ForegroundColor Yellow
    Set-Location $backendPath
    $buildResult = & ".\gradlew" clean build -x test
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Build successful! Starting application..." -ForegroundColor Green
        
        # 백그라운드에서 백엔드 시작 (완전히 분리)
        $scriptContent = @"
Set-Location '$backendPath'
Write-Host 'Backend starting...' -ForegroundColor Blue
.\gradlew bootRun
"@
        
        Start-Process powershell -ArgumentList "-NoExit", "-Command", $scriptContent -WindowStyle Normal
        Write-Host "Backend start command executed in new window" -ForegroundColor Green
        return $true
    } else {
        Write-Host "Build failed!" -ForegroundColor Red
        return $false
    }
}

function Start-Frontend {
    Write-Host "Starting Frontend..." -ForegroundColor Blue
    
    if (-not (Test-Path $frontendPath)) {
        Write-Host "Frontend directory not found: $frontendPath" -ForegroundColor Red
        return $false
    }
    
    # 프론트엔드 시작
    $scriptContent = @"
Set-Location '$frontendPath'
Write-Host 'Frontend starting...' -ForegroundColor Blue
npm run dev
"@
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $scriptContent -WindowStyle Normal
    Write-Host "Frontend start command executed in new window" -ForegroundColor Green
    return $true
}

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
    
    Write-Host "All services have been stopped." -ForegroundColor Green
}

# 메인 로직
switch ($Action.ToLower()) {
    "start" {
        Write-Host "Starting entire system..." -ForegroundColor Green
        
        # 백엔드 시작
        if (Start-Backend) {
            Write-Host "Backend started in new window" -ForegroundColor Green
        }
        
        # 프론트엔드 시작
        if (Start-Frontend) {
            Write-Host "Frontend started in new window" -ForegroundColor Green
        }
        
        Write-Host ""
        Write-Host "=== System Startup Complete! ===" -ForegroundColor Green
        Write-Host "Backend: http://localhost:8080" -ForegroundColor Cyan
        Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
        Write-Host "Swagger: http://localhost:8080/swagger-ui.html" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Check the new windows for service status!" -ForegroundColor Yellow
    }
    "backend" { 
        Start-Backend
        Write-Host "Backend started!" -ForegroundColor Green
    }
    "frontend" { 
        Start-Frontend
        Write-Host "Frontend started!" -ForegroundColor Green
    }
    "stop" { Stop-Services }
    default {
        Write-Host "Unknown action: $Action" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Script execution completed!" -ForegroundColor Green

