# Brotherhood System Master Control Script
param(
    [string]$Action = "start"
)

# Colors
$Green = "Green"
$Red = "Red"
$Yellow = "Yellow"
$Blue = "Blue"
$Cyan = "Cyan"

# Paths
$projectRoot = "C:\cckbm"
$backendPath = "$projectRoot\backend"
$frontendPath = "$projectRoot\brotherhood"

function Show-Help {
    Write-Host "=== Brotherhood System Master Control ===" -ForegroundColor $Cyan
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor $Yellow
    Write-Host "  .\scripts\master-control-simple.ps1 [action]"
    Write-Host ""
    Write-Host "Actions:" -ForegroundColor $Yellow
    Write-Host "  start     - Start entire system (backend + frontend)" -ForegroundColor $Green
    Write-Host "  backend   - Start backend only" -ForegroundColor $Green
    Write-Host "  frontend  - Start frontend only" -ForegroundColor $Green
    Write-Host "  status    - Check system status" -ForegroundColor $Green
    Write-Host "  stop      - Stop all services" -ForegroundColor $Red
    Write-Host "  help      - Show help" -ForegroundColor $Cyan
}

function Show-Status {
    Write-Host "=== Project Status ===" -ForegroundColor $Cyan
    Write-Host "Project Root: $projectRoot"
    Write-Host "Backend Path: $backendPath"
    Write-Host "Frontend Path: $frontendPath"
    Write-Host ""
    
    if (Test-Path $projectRoot) {
        Write-Host "✓ Project Root: Exists" -ForegroundColor $Green
    } else {
        Write-Host "✗ Project Root: Not Found" -ForegroundColor $Red
        return
    }
    
    if (Test-Path $backendPath) {
        Write-Host "✓ Backend Directory: Exists" -ForegroundColor $Green
    } else {
        Write-Host "✗ Backend Directory: Not Found" -ForegroundColor $Red
    }
    
    if (Test-Path $frontendPath) {
        Write-Host "✓ Frontend Directory: Exists" -ForegroundColor $Green
    } else {
        Write-Host "✗ Frontend Directory: Not Found" -ForegroundColor $Red
    }
}

function Start-Backend {
    Write-Host "=== Starting Backend ===" -ForegroundColor $Blue
    
    if (-not (Test-Path $backendPath)) {
        Write-Host "✗ Backend directory not found: $backendPath" -ForegroundColor $Red
        return $false
    }
    
    Set-Location $backendPath
    Write-Host "Changed to backend directory: $(Get-Location)"
    
    $scriptBlock = {
        param($path)
        Set-Location $path
        Write-Host "=== Starting Backend ===" -ForegroundColor Blue
        Write-Host "Directory: $(Get-Location)"
        Write-Host "Starting Gradle build..."
        .\gradlew clean build -x test
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Build successful! Starting application..." -ForegroundColor Green
            .\gradlew bootRun
        } else {
            Write-Host "Build failed!" -ForegroundColor Red
            Read-Host "Press Enter to exit"
        }
    }
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "& {$scriptBlock} '$backendPath'"
    Write-Host "✓ Backend start command executed (running in new window)" -ForegroundColor $Green
    return $true
}

function Start-Frontend {
    Write-Host "=== Starting Frontend ===" -ForegroundColor $Blue
    
    if (-not (Test-Path $frontendPath)) {
        Write-Host "✗ Frontend directory not found: $frontendPath" -ForegroundColor $Red
        return $false
    }
    
    Set-Location $frontendPath
    Write-Host "Changed to frontend directory: $(Get-Location)"
    
    $scriptBlock = {
        param($path)
        Set-Location $path
        Write-Host "=== Starting Frontend ===" -ForegroundColor Blue
        Write-Host "Directory: $(Get-Location)"
        Write-Host "Starting npm run dev..."
        npm run dev
    }
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "& {$scriptBlock} '$frontendPath'"
    Write-Host "✓ Frontend start command executed (running in new window)" -ForegroundColor $Green
    return $true
}

function Stop-Services {
    Write-Host "=== Stopping Services ===" -ForegroundColor $Red
    
    $javaProcesses = Get-Process | Where-Object { $_.ProcessName -like "*java*" }
    if ($javaProcesses) {
        $javaProcesses | Stop-Process -Force
        Write-Host "✓ Java processes stopped" -ForegroundColor $Green
    }
    
    $nodeProcesses = Get-Process | Where-Object { $_.ProcessName -like "*node*" }
    if ($nodeProcesses) {
        $nodeProcesses | Stop-Process -Force
        Write-Host "✓ Node.js processes stopped" -ForegroundColor $Green
    }
    
    Write-Host "All services have been stopped." -ForegroundColor $Yellow
}

# Main execution logic
Write-Host "=== Brotherhood System Master Control ===" -ForegroundColor $Cyan
Write-Host "Action: $Action" -ForegroundColor $Yellow
Write-Host ""

switch ($Action.ToLower()) {
    "start" {
        Show-Status
        Write-Host ""
        if (Start-Backend) {
            Write-Host "Waiting 15 seconds after backend start..." -ForegroundColor $Yellow
            Start-Sleep -Seconds 15
        }
        Start-Frontend
        Write-Host ""
        Write-Host "=== Startup Complete ===" -ForegroundColor $Green
        Write-Host "Backend: http://localhost:8080" -ForegroundColor $Cyan
        Write-Host "Frontend: http://localhost:3000" -ForegroundColor $Cyan
        Write-Host "Swagger UI: http://localhost:8080/swagger-ui.html" -ForegroundColor $Cyan
    }
    "backend" { Start-Backend }
    "frontend" { Start-Frontend }
    "status" { Show-Status }
    "stop" { Stop-Services }
    "restart" {
        Stop-Services
        Start-Sleep -Seconds 3
        if (Start-Backend) {
            Start-Sleep -Seconds 15
        }
        Start-Frontend
    }
    "help" { Show-Help }
    default {
        Write-Host "✗ Unknown action: $Action" -ForegroundColor $Red
        Write-Host ""
        Show-Help
    }
}

Write-Host ""
Write-Host "Script execution completed!" -ForegroundColor $Green
