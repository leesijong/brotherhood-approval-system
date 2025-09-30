# 데이터베이스 관리 스크립트
# PostgreSQL 데이터베이스를 관리합니다

param(
    [string]$Action = "connect",
    [string]$DbName = "approval_system_dev",
    [string]$User = "postgres"
)

# 색상 정의
$Green = "Green"
$Red = "Red"
$Yellow = "Yellow"
$Blue = "Blue"
$Cyan = "Cyan"

# PostgreSQL 경로 설정
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
        break
    }
}

if (-not $postgresPath) {
    Write-Host "❌ PostgreSQL을 찾을 수 없습니다!" -ForegroundColor $Red
    Write-Host "다음 경로들을 확인하세요:" -ForegroundColor $Yellow
    foreach ($path in $postgresPaths) {
        Write-Host "  - $path" -ForegroundColor $Yellow
    }
    exit 1
}

Write-Host "=== PostgreSQL 데이터베이스 관리 ===" -ForegroundColor $Cyan
Write-Host "PostgreSQL 경로: $postgresPath" -ForegroundColor $Blue
Write-Host "액션: $Action" -ForegroundColor $Yellow
Write-Host "데이터베이스: $DbName" -ForegroundColor $Yellow
Write-Host "사용자: $User" -ForegroundColor $Yellow
Write-Host ""

function Show-Help {
    Write-Host "사용법:" -ForegroundColor $Yellow
    Write-Host "  .\scripts\db-manage.ps1 [액션] [옵션]"
    Write-Host ""
    Write-Host "액션:" -ForegroundColor $Yellow
    Write-Host "  connect  - 데이터베이스 연결" -ForegroundColor $Green
    Write-Host "  create   - 데이터베이스 생성" -ForegroundColor $Green
    Write-Host "  drop     - 데이터베이스 삭제" -ForegroundColor $Red
    Write-Host "  list     - 데이터베이스 목록" -ForegroundColor $Green
    Write-Host "  backup   - 데이터베이스 백업" -ForegroundColor $Blue
    Write-Host "  restore  - 데이터베이스 복원" -ForegroundColor $Blue
    Write-Host "  status   - 데이터베이스 상태" -ForegroundColor $Green
    Write-Host ""
    Write-Host "예시:" -ForegroundColor $Yellow
    Write-Host "  .\scripts\db-manage.ps1 connect"
    Write-Host "  .\scripts\db-manage.ps1 create -DbName 'my_db'"
    Write-Host "  .\scripts\db-manage.ps1 list"
}

function Connect-Database {
    Write-Host "데이터베이스 연결 중..." -ForegroundColor $Blue
    try {
        & $postgresPath -U $User -d $DbName
    } catch {
        Write-Host "❌ 데이터베이스 연결 실패" -ForegroundColor $Red
        Write-Host "PostgreSQL이 실행 중인지 확인하세요." -ForegroundColor $Yellow
    }
}

function Create-Database {
    Write-Host "데이터베이스 생성 중: $DbName" -ForegroundColor $Blue
    try {
        $createCommand = "CREATE DATABASE `"$DbName`";"
        & $postgresPath -U $User -d postgres -c $createCommand
        Write-Host "✅ 데이터베이스 생성 완료: $DbName" -ForegroundColor $Green
    } catch {
        Write-Host "❌ 데이터베이스 생성 실패" -ForegroundColor $Red
        Write-Host "이미 존재하는 데이터베이스일 수 있습니다." -ForegroundColor $Yellow
    }
}

function Drop-Database {
    Write-Host "⚠️ 데이터베이스 삭제: $DbName" -ForegroundColor $Red
    $confirm = Read-Host "정말 삭제하시겠습니까? (y/N)"
    if ($confirm -eq "y" -or $confirm -eq "Y") {
        try {
            $dropCommand = "DROP DATABASE IF EXISTS `"$DbName`";"
            & $postgresPath -U $User -d postgres -c $dropCommand
            Write-Host "✅ 데이터베이스 삭제 완료: $DbName" -ForegroundColor $Green
        } catch {
            Write-Host "❌ 데이터베이스 삭제 실패" -ForegroundColor $Red
        }
    } else {
        Write-Host "데이터베이스 삭제가 취소되었습니다." -ForegroundColor $Yellow
    }
}

function List-Databases {
    Write-Host "데이터베이스 목록:" -ForegroundColor $Blue
    try {
        & $postgresPath -U $User -d postgres -l
    } catch {
        Write-Host "❌ 데이터베이스 목록 조회 실패" -ForegroundColor $Red
    }
}

function Backup-Database {
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupFile = "backup_${DbName}_${timestamp}.sql"
    
    Write-Host "데이터베이스 백업 중: $backupFile" -ForegroundColor $Blue
    try {
        $pgDumpPath = $postgresPath -replace "psql.exe", "pg_dump.exe"
        & $pgDumpPath -U $User -d $DbName -f $backupFile
        Write-Host "✅ 백업 완료: $backupFile" -ForegroundColor $Green
    } catch {
        Write-Host "❌ 백업 실패" -ForegroundColor $Red
    }
}

function Restore-Database {
    $backupFile = Read-Host "복원할 백업 파일명을 입력하세요"
    
    if (-not (Test-Path $backupFile)) {
        Write-Host "❌ 백업 파일을 찾을 수 없습니다: $backupFile" -ForegroundColor $Red
        return
    }
    
    Write-Host "⚠️ 데이터베이스 복원: $DbName" -ForegroundColor $Red
    $confirm = Read-Host "기존 데이터가 덮어써집니다. 계속하시겠습니까? (y/N)"
    
    if ($confirm -eq "y" -or $confirm -eq "Y") {
        try {
            & $postgresPath -U $User -d $DbName -f $backupFile
            Write-Host "✅ 데이터베이스 복원 완료: $DbName" -ForegroundColor $Green
        } catch {
            Write-Host "❌ 데이터베이스 복원 실패" -ForegroundColor $Red
        }
    } else {
        Write-Host "데이터베이스 복원이 취소되었습니다." -ForegroundColor $Yellow
    }
}

function Check-DatabaseStatus {
    Write-Host "데이터베이스 상태 확인 중..." -ForegroundColor $Blue
    
    # PostgreSQL 서비스 상태
    try {
        & $postgresPath -U $User -d postgres -c "SELECT version();" | Out-Null
        Write-Host "✅ PostgreSQL: 실행 중" -ForegroundColor $Green
    } catch {
        Write-Host "❌ PostgreSQL: 연결 실패" -ForegroundColor $Red
        return
    }
    
    # 데이터베이스 존재 여부
    try {
        $checkCommand = "SELECT 1 FROM pg_database WHERE datname = '$DbName';"
        $result = & $postgresPath -U $User -d postgres -t -c $checkCommand
        if ($result -match "1") {
            Write-Host "✅ 데이터베이스 존재: $DbName" -ForegroundColor $Green
        } else {
            Write-Host "❌ 데이터베이스 없음: $DbName" -ForegroundColor $Red
        }
    } catch {
        Write-Host "❌ 데이터베이스 상태 확인 실패" -ForegroundColor $Red
    }
    
    # 테이블 목록
    try {
        Write-Host "테이블 목록:" -ForegroundColor $Blue
        & $postgresPath -U $User -d $DbName -c "\dt"
    } catch {
        Write-Host "❌ 테이블 목록 조회 실패" -ForegroundColor $Red
    }
}

# 메인 실행 로직
switch ($Action.ToLower()) {
    "connect" { Connect-Database }
    "create" { Create-Database }
    "drop" { Drop-Database }
    "list" { List-Databases }
    "backup" { Backup-Database }
    "restore" { Restore-Database }
    "status" { Check-DatabaseStatus }
    "help" { Show-Help }
    default {
        Write-Host "❌ 알 수 없는 액션: $Action" -ForegroundColor $Red
        Write-Host ""
        Show-Help
    }
}
