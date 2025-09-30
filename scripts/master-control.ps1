# Brotherhood 결재 시스템 마스터 제어 스크립트
param(
    [string]$Action = "start",
    [switch]$Help
)

# 색상 정의
$Green = "Green"
$Red = "Red"
$Yellow = "Yellow"
$Blue = "Blue"
$Cyan = "Cyan"

# 경로 설정
$projectRoot = "C:\cckbm"
$backendPath = "$projectRoot\backend"
$frontendPath = "$projectRoot\brotherhood"
$postgresPath = "C:\Program Files\PostgreSQL\17\bin\psql.exe"

function Show-Help {
    Write-Host "=== Brotherhood 결재 시스템 마스터 제어 ===" -ForegroundColor $Cyan
    Write-Host ""
    Write-Host "사용법:" -ForegroundColor $Yellow
    Write-Host "  .\scripts\master-control.ps1 [액션]"
    Write-Host ""
    Write-Host "액션:" -ForegroundColor $Yellow
    Write-Host "  start     - 전체 시스템 시작 (백엔드 + 프론트엔드)" -ForegroundColor $Green
    Write-Host "  backend   - 백엔드만 시작" -ForegroundColor $Green
    Write-Host "  frontend  - 프론트엔드만 시작" -ForegroundColor $Green
    Write-Host "  db        - 데이터베이스 연결" -ForegroundColor $Green
    Write-Host "  status    - 시스템 상태 확인" -ForegroundColor $Green
    Write-Host "  stop      - 모든 서비스 중지" -ForegroundColor $Red
    Write-Host "  restart   - 전체 시스템 재시작" -ForegroundColor $Yellow
    Write-Host "  help      - 도움말 표시" -ForegroundColor $Cyan
    Write-Host ""
    Write-Host "예시:" -ForegroundColor $Yellow
    Write-Host "  .\scripts\master-control.ps1 start"
    Write-Host "  .\scripts\master-control.ps1 backend"
    Write-Host "  .\scripts\master-control.ps1 db"
}

function Show-Status {
    Write-Host "=== 프로젝트 상태 ===" -ForegroundColor $Cyan
    Write-Host "프로젝트 루트: $projectRoot"
    Write-Host "백엔드 경로: $backendPath"
    Write-Host "프론트엔드 경로: $frontendPath"
    Write-Host ""
    
    if (Test-Path $projectRoot) {
        Write-Host "✅ 프로젝트 루트: 존재" -ForegroundColor $Green
    } else {
        Write-Host "❌ 프로젝트 루트: 없음" -ForegroundColor $Red
        return
    }
    
    if (Test-Path $backendPath) {
        Write-Host "✅ 백엔드 디렉토리: 존재" -ForegroundColor $Green
    } else {
        Write-Host "❌ 백엔드 디렉토리: 없음" -ForegroundColor $Red
    }
    
    if (Test-Path $frontendPath) {
        Write-Host "✅ 프론트엔드 디렉토리: 존재" -ForegroundColor $Green
    } else {
        Write-Host "❌ 프론트엔드 디렉토리: 없음" -ForegroundColor $Red
    }
}

function Start-Backend {
    Write-Host "=== 백엔드 시작 ===" -ForegroundColor $Blue
    
    if (-not (Test-Path $backendPath)) {
        Write-Host "❌ 백엔드 디렉토리를 찾을 수 없습니다: $backendPath" -ForegroundColor $Red
        return $false
    }
    
    Set-Location $backendPath
    Write-Host "백엔드 디렉토리로 이동: $(Get-Location)"
    
    # 백엔드 시작 (새 창에서)
    $scriptBlock = {
        param($path)
        Set-Location $path
        Write-Host "=== 백엔드 시작 ===" -ForegroundColor Blue
        Write-Host "디렉토리: $(Get-Location)"
        Write-Host "Gradle 빌드 시작..."
        .\gradlew clean build -x test
        if ($LASTEXITCODE -eq 0) {
            Write-Host "빌드 성공! 애플리케이션 시작..." -ForegroundColor Green
            .\gradlew bootRun
        } else {
            Write-Host "빌드 실패!" -ForegroundColor Red
            Read-Host "Enter 키를 눌러 종료하세요"
        }
    }
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "& {$scriptBlock} '$backendPath'"
    Write-Host "✅ 백엔드 시작 명령 실행됨 (새 창에서 실행 중)" -ForegroundColor $Green
    return $true
}

function Start-Frontend {
    Write-Host "=== 프론트엔드 시작 ===" -ForegroundColor $Blue
    
    if (-not (Test-Path $frontendPath)) {
        Write-Host "❌ 프론트엔드 디렉토리를 찾을 수 없습니다: $frontendPath" -ForegroundColor $Red
        return $false
    }
    
    Set-Location $frontendPath
    Write-Host "프론트엔드 디렉토리로 이동: $(Get-Location)"
    
    # 프론트엔드 시작 (새 창에서)
    $scriptBlock = {
        param($path)
        Set-Location $path
        Write-Host "=== 프론트엔드 시작 ===" -ForegroundColor Blue
        Write-Host "디렉토리: $(Get-Location)"
        Write-Host "npm run dev 시작..."
        npm run dev
    }
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "& {$scriptBlock} '$frontendPath'"
    Write-Host "✅ 프론트엔드 시작 명령 실행됨 (새 창에서 실행 중)" -ForegroundColor $Green
    return $true
}

function Connect-Database {
    Write-Host "=== 데이터베이스 연결 ===" -ForegroundColor $Blue
    
    if (-not (Test-Path $postgresPath)) {
        Write-Host "❌ PostgreSQL을 찾을 수 없습니다: $postgresPath" -ForegroundColor $Red
        Write-Host "일반적인 경로를 확인하세요:" -ForegroundColor $Yellow
        Write-Host "- C:\Program Files\PostgreSQL\17\bin\psql.exe"
        Write-Host "- C:\Program Files\PostgreSQL\16\bin\psql.exe"
        return
    }
    
    Write-Host "데이터베이스: approval_system_dev"
    Write-Host "사용자: postgres"
    Write-Host "PostgreSQL 연결 중..."
    
    try {
        & $postgresPath -U postgres -d approval_system_dev
    } catch {
        Write-Host "❌ 데이터베이스 연결 실패" -ForegroundColor $Red
        Write-Host "PostgreSQL이 실행 중인지 확인하세요." -ForegroundColor $Yellow
    }
}

function Stop-Services {
    Write-Host "=== 서비스 중지 ===" -ForegroundColor $Red
    
    # Java 프로세스 종료
    $javaProcesses = Get-Process | Where-Object { $_.ProcessName -like "*java*" }
    if ($javaProcesses) {
        $javaProcesses | Stop-Process -Force
        Write-Host "✅ Java 프로세스 종료됨" -ForegroundColor $Green
    }
    
    # Node.js 프로세스 종료
    $nodeProcesses = Get-Process | Where-Object { $_.ProcessName -like "*node*" }
    if ($nodeProcesses) {
        $nodeProcesses | Stop-Process -Force
        Write-Host "✅ Node.js 프로세스 종료됨" -ForegroundColor $Green
    }
    
    Write-Host "모든 서비스가 중지되었습니다." -ForegroundColor $Yellow
}

# 메인 실행 로직
if ($Help) {
    Show-Help
    exit 0
}

Write-Host "=== Brotherhood 결재 시스템 마스터 제어 ===" -ForegroundColor $Cyan
Write-Host "액션: $Action" -ForegroundColor $Yellow
Write-Host ""

switch ($Action.ToLower()) {
    "start" {
        Show-Status
        Write-Host ""
        if (Start-Backend) {
            Write-Host "백엔드 시작 후 15초 대기 중..." -ForegroundColor $Yellow
            Start-Sleep -Seconds 15
        }
        Start-Frontend
        Write-Host ""
        Write-Host "=== 시작 완료 ===" -ForegroundColor $Green
        Write-Host "백엔드: http://localhost:8080" -ForegroundColor $Cyan
        Write-Host "프론트엔드: http://localhost:3000" -ForegroundColor $Cyan
        Write-Host "Swagger UI: http://localhost:8080/swagger-ui.html" -ForegroundColor $Cyan
    }
    "backend" { Start-Backend }
    "frontend" { Start-Frontend }
    "db" { Connect-Database }
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
        Write-Host "❌ 알 수 없는 액션: $Action" -ForegroundColor $Red
        Write-Host ""
        Show-Help
    }
}

Write-Host ""
Write-Host "스크립트 실행 완료!" -ForegroundColor $Green
