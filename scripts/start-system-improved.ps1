# Brotherhood System Improved Start Script
# 개선된 시스템 시작 스크립트 - 대기 문제 해결

param(
    [string]$Action = "start"
)

Write-Host "=== Brotherhood System Improved Start ===" -ForegroundColor Cyan
Write-Host "Action: $Action" -ForegroundColor Yellow
Write-Host ""

$projectRoot = "C:\cckbm"
$backendPath = "$projectRoot\backend"
$frontendPath = "$projectRoot\brotherhood"

function Show-Help {
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\scripts\start-system-improved.ps1 [action]"
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
    
    # 백엔드 빌드
    Write-Host "Building backend..." -ForegroundColor Yellow
    Set-Location $backendPath
    $buildResult = & ".\gradlew" clean build -x test
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Build successful! Starting application..." -ForegroundColor Green
        
        # 백그라운드에서 백엔드 시작
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
        $javaProcesses | Stop-Process -Force
        Write-Host "Java processes stopped" -ForegroundColor Green
    }
    
    # Node.js 프로세스 중지
    $nodeProcesses = Get-Process | Where-Object { $_.ProcessName -like "*node*" }
    if ($nodeProcesses) {
        $nodeProcesses | Stop-Process -Force
        Write-Host "Node.js processes stopped" -ForegroundColor Green
    }
    
    Write-Host "All services have been stopped." -ForegroundColor Yellow
}

function Wait-ForService {
    param(
        [string]$ServiceName,
        [string]$Url,
        [int]$MaxWaitSeconds = 60
    )
    
    Write-Host "Waiting for $ServiceName to start..." -ForegroundColor Yellow
    $waitTime = 0
    
    while ($waitTime -lt $MaxWaitSeconds) {
        try {
            $response = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec 5 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                Write-Host "$ServiceName is ready!" -ForegroundColor Green
                return $true
            }
        } catch {
            # 서비스가 아직 시작되지 않음
        }
        
        Start-Sleep -Seconds 2
        $waitTime += 2
        Write-Host "Waiting... ($waitTime/$MaxWaitSeconds seconds)" -ForegroundColor Gray
    }
    
    Write-Host "$ServiceName did not start within $MaxWaitSeconds seconds" -ForegroundColor Red
    return $false
}

# 메인 로직
switch ($Action.ToLower()) {
    "start" {
        Write-Host "Starting entire system..." -ForegroundColor Green
        
        # 백엔드 시작
        if (Start-Backend) {
            Write-Host "Backend started, waiting for it to be ready..." -ForegroundColor Yellow
            Start-Sleep -Seconds 5  # 백엔드 시작 대기
            
            # 백엔드가 준비될 때까지 대기
            if (Wait-ForService "Backend" "http://localhost:8080/api/health" 60) {
                Write-Host "Backend is ready!" -ForegroundColor Green
            } else {
                Write-Host "Backend may not be ready, but continuing..." -ForegroundColor Yellow
            }
        }
        
        # 프론트엔드 시작
        if (Start-Frontend) {
            Write-Host "Frontend started!" -ForegroundColor Green
        }
        
        Write-Host ""
        Write-Host "=== System Startup Complete! ===" -ForegroundColor Green
        Write-Host "Backend: http://localhost:8080" -ForegroundColor Cyan
        Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
        Write-Host "Swagger: http://localhost:8080/swagger-ui.html" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "You can now test the system!" -ForegroundColor Yellow
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
    "help" { Show-Help }
    default {
        Write-Host "Unknown action: $Action" -ForegroundColor Red
        Show-Help
    }
}

Write-Host ""
Write-Host "Script execution completed!" -ForegroundColor Green


