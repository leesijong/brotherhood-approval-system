# 시스템 상태 확인 스크립트
# 모든 서비스의 실행 상태를 확인합니다

# 색상 정의
$Green = "Green"
$Red = "Red"
$Yellow = "Yellow"
$Blue = "Blue"
$Cyan = "Cyan"

Write-Host "=== Brotherhood 결재 시스템 상태 확인 ===" -ForegroundColor $Cyan
Write-Host ""

# 프로젝트 디렉토리 확인
$projectRoot = "C:\cckbm"
$backendPath = "$projectRoot\backend"
$frontendPath = "$projectRoot\brotherhood"

Write-Host "📁 프로젝트 구조 확인:" -ForegroundColor $Blue
if (Test-Path $projectRoot) {
    Write-Host "  ✅ 프로젝트 루트: $projectRoot" -ForegroundColor $Green
} else {
    Write-Host "  ❌ 프로젝트 루트: $projectRoot" -ForegroundColor $Red
}

if (Test-Path $backendPath) {
    Write-Host "  ✅ 백엔드 디렉토리: $backendPath" -ForegroundColor $Green
} else {
    Write-Host "  ❌ 백엔드 디렉토리: $backendPath" -ForegroundColor $Red
}

if (Test-Path $frontendPath) {
    Write-Host "  ✅ 프론트엔드 디렉토리: $frontendPath" -ForegroundColor $Green
} else {
    Write-Host "  ❌ 프론트엔드 디렉토리: $frontendPath" -ForegroundColor $Red
}

Write-Host ""

# 개발 도구 확인
Write-Host "🔧 개발 도구 확인:" -ForegroundColor $Blue

# Java 확인
try {
    $javaVersion = java -version 2>&1 | Select-String "version"
    if ($javaVersion) {
        Write-Host "  ✅ Java: $javaVersion" -ForegroundColor $Green
    }
} catch {
    Write-Host "  ❌ Java: 설치되지 않음" -ForegroundColor $Red
}

# Node.js 확인
try {
    $nodeVersion = node --version
    Write-Host "  ✅ Node.js: $nodeVersion" -ForegroundColor $Green
} catch {
    Write-Host "  ❌ Node.js: 설치되지 않음" -ForegroundColor $Red
}

# npm 확인
try {
    $npmVersion = npm --version
    Write-Host "  ✅ npm: $npmVersion" -ForegroundColor $Green
} catch {
    Write-Host "  ❌ npm: 설치되지 않음" -ForegroundColor $Red
}

# Gradle 확인
if (Test-Path "$backendPath\gradlew.bat") {
    Write-Host "  ✅ Gradle Wrapper: 존재" -ForegroundColor $Green
} else {
    Write-Host "  ❌ Gradle Wrapper: 없음" -ForegroundColor $Red
}

Write-Host ""

# PostgreSQL 확인
Write-Host "🗄️ PostgreSQL 확인:" -ForegroundColor $Blue
$postgresPaths = @(
    "C:\Program Files\PostgreSQL\17\bin\psql.exe",
    "C:\Program Files\PostgreSQL\16\bin\psql.exe",
    "C:\Program Files\PostgreSQL\15\bin\psql.exe",
    "C:\Program Files\PostgreSQL\14\bin\psql.exe"
)

$postgresPath = $null
foreach ($path in $postgresPaths) {
    if (Test-Path $path) {
        $postgresPath = $path
        Write-Host "  ✅ PostgreSQL: $path" -ForegroundColor $Green
        break
    }
}

if (-not $postgresPath) {
    Write-Host "  ❌ PostgreSQL: 설치되지 않음" -ForegroundColor $Red
}

# PostgreSQL 연결 테스트
if ($postgresPath) {
    try {
        $result = & $postgresPath -U postgres -d postgres -c "SELECT 1;" 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ PostgreSQL: 연결 성공" -ForegroundColor $Green
        } else {
            Write-Host "  ❌ PostgreSQL: 연결 실패" -ForegroundColor $Red
        }
    } catch {
        Write-Host "  ❌ PostgreSQL: 연결 테스트 실패" -ForegroundColor $Red
    }
}

Write-Host ""

# 서비스 상태 확인
Write-Host "🌐 서비스 상태 확인:" -ForegroundColor $Blue

# 백엔드 상태 확인
try {
    $backendResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/health" -Method Get -TimeoutSec 3
    Write-Host "  ✅ 백엔드: 실행 중 (포트 8080)" -ForegroundColor $Green
    Write-Host "     URL: http://localhost:8080" -ForegroundColor $Cyan
    Write-Host "     Swagger: http://localhost:8080/swagger-ui.html" -ForegroundColor $Cyan
} catch {
    Write-Host "  ❌ 백엔드: 실행되지 않음 (포트 8080)" -ForegroundColor $Red
}

# 프론트엔드 상태 확인
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3000" -Method Get -TimeoutSec 3
    Write-Host "  ✅ 프론트엔드: 실행 중 (포트 3000)" -ForegroundColor $Green
    Write-Host "     URL: http://localhost:3000" -ForegroundColor $Cyan
} catch {
    Write-Host "  ❌ 프론트엔드: 실행되지 않음 (포트 3000)" -ForegroundColor $Red
}

Write-Host ""

# 프로세스 확인
Write-Host "🔄 실행 중인 프로세스:" -ForegroundColor $Blue

# Java 프로세스 (백엔드)
$javaProcesses = Get-Process | Where-Object { $_.ProcessName -like "*java*" }
if ($javaProcesses) {
    Write-Host "  ✅ Java 프로세스: $($javaProcesses.Count)개 실행 중" -ForegroundColor $Green
    foreach ($process in $javaProcesses) {
        Write-Host "     - PID: $($process.Id), 메모리: $([math]::Round($process.WorkingSet64/1MB, 2))MB" -ForegroundColor $Cyan
    }
} else {
    Write-Host "  ❌ Java 프로세스: 실행되지 않음" -ForegroundColor $Red
}

# Node.js 프로세스 (프론트엔드)
$nodeProcesses = Get-Process | Where-Object { $_.ProcessName -like "*node*" }
if ($nodeProcesses) {
    Write-Host "  ✅ Node.js 프로세스: $($nodeProcesses.Count)개 실행 중" -ForegroundColor $Green
    foreach ($process in $nodeProcesses) {
        Write-Host "     - PID: $($process.Id), 메모리: $([math]::Round($process.WorkingSet64/1MB, 2))MB" -ForegroundColor $Cyan
    }
} else {
    Write-Host "  ❌ Node.js 프로세스: 실행되지 않음" -ForegroundColor $Red
}

Write-Host ""

# 포트 사용 확인
Write-Host "🔌 포트 사용 확인:" -ForegroundColor $Blue

# 포트 8080 (백엔드)
$port8080 = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
if ($port8080) {
    Write-Host "  ✅ 포트 8080: 사용 중 (백엔드)" -ForegroundColor $Green
} else {
    Write-Host "  ❌ 포트 8080: 사용되지 않음" -ForegroundColor $Red
}

# 포트 3000 (프론트엔드)
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($port3000) {
    Write-Host "  ✅ 포트 3000: 사용 중 (프론트엔드)" -ForegroundColor $Green
} else {
    Write-Host "  ❌ 포트 3000: 사용되지 않음" -ForegroundColor $Red
}

# 포트 5432 (PostgreSQL)
$port5432 = Get-NetTCPConnection -LocalPort 5432 -ErrorAction SilentlyContinue
if ($port5432) {
    Write-Host "  ✅ 포트 5432: 사용 중 (PostgreSQL)" -ForegroundColor $Green
} else {
    Write-Host "  ❌ 포트 5432: 사용되지 않음" -ForegroundColor $Red
}

Write-Host ""
Write-Host "=== 상태 확인 완료 ===" -ForegroundColor $Green
Write-Host ""
Write-Host "💡 도움말:" -ForegroundColor $Yellow
Write-Host "  .\scripts\master-control.ps1 start   # 전체 시스템 시작" -ForegroundColor $Cyan
Write-Host "  .\scripts\master-control.ps1 stop    # 모든 서비스 중지" -ForegroundColor $Cyan
Write-Host "  .\scripts\master-control.ps1 restart # 전체 시스템 재시작" -ForegroundColor $Cyan
