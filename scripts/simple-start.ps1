# Brotherhood System Simple Start Script
param(
    [string]$Action = "start"
)

Write-Host "=== Brotherhood System Simple Start ===" -ForegroundColor Cyan
Write-Host "Action: $Action" -ForegroundColor Yellow
Write-Host ""

$projectRoot = "C:\cckbm"
$backendPath = "$projectRoot\backend"
$frontendPath = "$projectRoot\brotherhood"

function Show-Help {
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\scripts\simple-start.ps1 [action]"
    Write-Host ""
    Write-Host "Actions:" -ForegroundColor Yellow
    Write-Host "  start     - Start entire system"
    Write-Host "  backend   - Start backend only"
    Write-Host "  frontend  - Start frontend only"
    Write-Host "  stop      - Stop all services"
    Write-Host "  help      - Show help"
}

function Start-Backend {
    Write-Host "Starting Backend..." -ForegroundColor Blue
    
    if (-not (Test-Path $backendPath)) {
        Write-Host "Backend directory not found: $backendPath" -ForegroundColor Red
        return $false
    }
    
    $scriptContent = @"
Set-Location '$backendPath'
Write-Host 'Starting Backend...' -ForegroundColor Blue
Write-Host 'Directory: ' + (Get-Location)
.\gradlew clean build -x test
if (`$LASTEXITCODE -eq 0) {
    Write-Host 'Build successful! Starting application...' -ForegroundColor Green
    .\gradlew bootRun
} else {
    Write-Host 'Build failed!' -ForegroundColor Red
    Read-Host 'Press Enter to exit'
}
"@
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $scriptContent
    Write-Host "Backend start command executed" -ForegroundColor Green
    return $true
}

function Start-Frontend {
    Write-Host "Starting Frontend..." -ForegroundColor Blue
    
    if (-not (Test-Path $frontendPath)) {
        Write-Host "Frontend directory not found: $frontendPath" -ForegroundColor Red
        return $false
    }
    
    $scriptContent = @"
Set-Location '$frontendPath'
Write-Host 'Starting Frontend...' -ForegroundColor Blue
Write-Host 'Directory: ' + (Get-Location)
npm run dev
"@
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $scriptContent
    Write-Host "Frontend start command executed" -ForegroundColor Green
    return $true
}

function Stop-Services {
    Write-Host "Stopping Services..." -ForegroundColor Red
    
    $javaProcesses = Get-Process | Where-Object { $_.ProcessName -like "*java*" }
    if ($javaProcesses) {
        $javaProcesses | Stop-Process -Force
        Write-Host "Java processes stopped" -ForegroundColor Green
    }
    
    $nodeProcesses = Get-Process | Where-Object { $_.ProcessName -like "*node*" }
    if ($nodeProcesses) {
        $nodeProcesses | Stop-Process -Force
        Write-Host "Node.js processes stopped" -ForegroundColor Green
    }
    
    Write-Host "All services have been stopped." -ForegroundColor Yellow
}

switch ($Action.ToLower()) {
    "start" {
        if (Start-Backend) {
            Write-Host "Waiting 15 seconds after backend start..." -ForegroundColor Yellow
            Start-Sleep -Seconds 15
        }
        Start-Frontend
        Write-Host ""
        Write-Host "Startup Complete!" -ForegroundColor Green
        Write-Host "Backend: http://localhost:8080" -ForegroundColor Cyan
        Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
    }
    "backend" { Start-Backend }
    "frontend" { Start-Frontend }
    "stop" { Stop-Services }
    "help" { Show-Help }
    default {
        Write-Host "Unknown action: $Action" -ForegroundColor Red
        Show-Help
    }
}

Write-Host ""
Write-Host "Script execution completed!" -ForegroundColor Green
