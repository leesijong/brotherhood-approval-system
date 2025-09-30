# PostgreSQL 환경 설정 스크립트
# PostgreSQL 경로와 환경변수를 설정합니다

# 색상 정의
$Green = "Green"
$Red = "Red"
$Yellow = "Yellow"
$Blue = "Blue"
$Cyan = "Cyan"

Write-Host "=== PostgreSQL 환경 설정 ===" -ForegroundColor $Cyan

# PostgreSQL 설치 경로 찾기
$postgresPaths = @(
    "C:\Program Files\PostgreSQL\17\bin",
    "C:\Program Files\PostgreSQL\16\bin",
    "C:\Program Files\PostgreSQL\15\bin",
    "C:\Program Files\PostgreSQL\14\bin",
    "C:\Program Files\PostgreSQL\13\bin"
)

$foundPath = $null
foreach ($path in $postgresPaths) {
    if (Test-Path $path) {
        $foundPath = $path
        Write-Host "✅ PostgreSQL 발견: $path" -ForegroundColor $Green
        break
    }
}

if (-not $foundPath) {
    Write-Host "❌ PostgreSQL을 찾을 수 없습니다!" -ForegroundColor $Red
    Write-Host "다음 경로들을 확인하세요:" -ForegroundColor $Yellow
    foreach ($path in $postgresPaths) {
        Write-Host "  - $path" -ForegroundColor $Yellow
    }
    Write-Host ""
    Write-Host "PostgreSQL이 설치되지 않았다면 다음 명령어로 설치하세요:" -ForegroundColor $Yellow
    Write-Host "  .\scripts\install-postgresql.ps1" -ForegroundColor $Cyan
    exit 1
}

# 환경변수 설정
$currentPath = $env:PATH
if ($currentPath -notlike "*$foundPath*") {
    Write-Host "PATH에 PostgreSQL 경로 추가 중..." -ForegroundColor $Blue
    $env:PATH += ";$foundPath"
    
    # 사용자 환경변수에 영구 설정
    [Environment]::SetEnvironmentVariable("PATH", $env:PATH, "User")
    [Environment]::SetEnvironmentVariable("PGPATH", $foundPath, "User")
    
    Write-Host "✅ PATH 환경변수 업데이트 완료" -ForegroundColor $Green
} else {
    Write-Host "✅ PATH에 PostgreSQL 경로가 이미 설정됨" -ForegroundColor $Green
}

# PostgreSQL 도구들 확인
$tools = @("psql.exe", "pg_dump.exe", "pg_restore.exe", "createdb.exe", "dropdb.exe")
Write-Host ""
Write-Host "PostgreSQL 도구 확인:" -ForegroundColor $Blue

foreach ($tool in $tools) {
    $toolPath = Join-Path $foundPath $tool
    if (Test-Path $toolPath) {
        Write-Host "  ✅ $tool" -ForegroundColor $Green
    } else {
        Write-Host "  ❌ $tool" -ForegroundColor $Red
    }
}

# 데이터베이스 연결 테스트
Write-Host ""
Write-Host "데이터베이스 연결 테스트..." -ForegroundColor $Blue

try {
    $psqlPath = Join-Path $foundPath "psql.exe"
    $result = & $psqlPath -U postgres -d postgres -c "SELECT version();" 2>$null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ PostgreSQL 연결 성공" -ForegroundColor $Green
        
        # PostgreSQL 버전 정보 추출
        if ($result -match "PostgreSQL (\d+\.\d+)") {
            $version = $matches[1]
            Write-Host "  버전: PostgreSQL $version" -ForegroundColor $Cyan
        }
    } else {
        Write-Host "❌ PostgreSQL 연결 실패" -ForegroundColor $Red
        Write-Host "  PostgreSQL 서비스가 실행 중인지 확인하세요." -ForegroundColor $Yellow
    }
} catch {
    Write-Host "❌ PostgreSQL 연결 테스트 실패" -ForegroundColor $Red
    Write-Host "  오류: $($_.Exception.Message)" -ForegroundColor $Yellow
}

# 프로젝트 데이터베이스 확인
Write-Host ""
Write-Host "프로젝트 데이터베이스 확인..." -ForegroundColor $Blue

try {
    $psqlPath = Join-Path $foundPath "psql.exe"
    $dbCheck = & $psqlPath -U postgres -d postgres -t -c "SELECT 1 FROM pg_database WHERE datname = 'approval_system_dev';" 2>$null
    
    if ($dbCheck -match "1") {
        Write-Host "✅ 프로젝트 데이터베이스 존재: approval_system_dev" -ForegroundColor $Green
    } else {
        Write-Host "⚠️ 프로젝트 데이터베이스 없음: approval_system_dev" -ForegroundColor $Yellow
        Write-Host "  다음 명령어로 데이터베이스를 생성하세요:" -ForegroundColor $Yellow
        Write-Host "  .\scripts\db-manage.ps1 create" -ForegroundColor $Cyan
    }
} catch {
    Write-Host "❌ 데이터베이스 확인 실패" -ForegroundColor $Red
}

Write-Host ""
Write-Host "=== PostgreSQL 환경 설정 완료 ===" -ForegroundColor $Green
Write-Host ""
Write-Host "사용 가능한 명령어:" -ForegroundColor $Yellow
Write-Host "  .\scripts\db-manage.ps1 connect  # 데이터베이스 연결" -ForegroundColor $Cyan
Write-Host "  .\scripts\db-manage.ps1 status   # 데이터베이스 상태 확인" -ForegroundColor $Cyan
Write-Host "  .\scripts\db-manage.ps1 list     # 데이터베이스 목록" -ForegroundColor $Cyan
