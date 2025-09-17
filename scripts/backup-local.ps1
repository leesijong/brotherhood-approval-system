# 로컬 개발 환경 백업 스크립트

Write-Host "=== 로컬 개발 환경 백업 ===" -ForegroundColor Green
Write-Host ""

# 백업 디렉토리 생성
$backupDir = "backups\$(Get-Date -Format 'yyyy-MM-dd_HH-mm-ss')"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
Write-Host "백업 디렉토리 생성: $backupDir" -ForegroundColor Yellow

# 1. 데이터베이스 백업
Write-Host "`n1. 데이터베이스 백업 중..." -ForegroundColor Yellow
try {
    $env:PATH += ";C:\Program Files\PostgreSQL\16\bin"
    $dbBackupFile = "$backupDir\approval_system_dev_backup.sql"
    & pg_dump -U approval_user -h localhost -d approval_system_dev -f $dbBackupFile
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ 데이터베이스 백업 완료: $dbBackupFile" -ForegroundColor Green
    } else {
        Write-Host "✗ 데이터베이스 백업 실패" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ 데이터베이스 백업 실패: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. 업로드 파일 백업
Write-Host "`n2. 업로드 파일 백업 중..." -ForegroundColor Yellow
if (Test-Path "uploads") {
    $uploadsBackupDir = "$backupDir\uploads"
    Copy-Item -Path "uploads" -Destination $uploadsBackupDir -Recurse -Force
    Write-Host "✓ 업로드 파일 백업 완료: $uploadsBackupDir" -ForegroundColor Green
} else {
    Write-Host "! 업로드 디렉토리가 없습니다." -ForegroundColor Yellow
}

# 3. 로그 파일 백업
Write-Host "`n3. 로그 파일 백업 중..." -ForegroundColor Yellow
if (Test-Path "logs") {
    $logsBackupDir = "$backupDir\logs"
    Copy-Item -Path "logs" -Destination $logsBackupDir -Recurse -Force
    Write-Host "✓ 로그 파일 백업 완료: $logsBackupDir" -ForegroundColor Green
} else {
    Write-Host "! 로그 디렉토리가 없습니다." -ForegroundColor Yellow
}

# 4. 설정 파일 백업
Write-Host "`n4. 설정 파일 백업 중..." -ForegroundColor Yellow
$configBackupDir = "$backupDir\config"
New-Item -ItemType Directory -Path $configBackupDir -Force | Out-Null

if (Test-Path "config") {
    Copy-Item -Path "config\*" -Destination $configBackupDir -Recurse -Force
    Write-Host "✓ 설정 파일 백업 완료: $configBackupDir" -ForegroundColor Green
} else {
    Write-Host "! 설정 디렉토리가 없습니다." -ForegroundColor Yellow
}

# 5. 프로젝트 소스 코드 백업 (Git 제외)
Write-Host "`n5. 프로젝트 소스 코드 백업 중..." -ForegroundColor Yellow
$sourceBackupDir = "$backupDir\source"
New-Item -ItemType Directory -Path $sourceBackupDir -Force | Out-Null

# Git 제외하고 소스 코드 복사
$excludeItems = @(".git", "node_modules", "target", "build", ".gradle", "logs", "uploads", "backups")
Get-ChildItem -Path "." -Exclude $excludeItems | Copy-Item -Destination $sourceBackupDir -Recurse -Force
Write-Host "✓ 소스 코드 백업 완료: $sourceBackupDir" -ForegroundColor Green

# 6. 백업 정보 파일 생성
Write-Host "`n6. 백업 정보 파일 생성 중..." -ForegroundColor Yellow
$backupInfo = @{
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    version = "1.0.0"
    description = "로컬 개발 환경 백업"
    database = "approval_system_dev"
    backup_type = "full"
    files = @{
        database = if (Test-Path "$backupDir\approval_system_dev_backup.sql") { "approval_system_dev_backup.sql" } else { $null }
        uploads = if (Test-Path "$backupDir\uploads") { "uploads/" } else { $null }
        logs = if (Test-Path "$backupDir\logs") { "logs/" } else { $null }
        config = if (Test-Path "$backupDir\config") { "config/" } else { $null }
        source = if (Test-Path "$backupDir\source") { "source/" } else { $null }
    }
}

$backupInfo | ConvertTo-Json -Depth 3 | Out-File -FilePath "$backupDir\backup-info.json" -Encoding UTF8
Write-Host "✓ 백업 정보 파일 생성 완료: backup-info.json" -ForegroundColor Green

# 7. 백업 압축
Write-Host "`n7. 백업 압축 중..." -ForegroundColor Yellow
try {
    $zipFile = "backups\backup_$(Get-Date -Format 'yyyy-MM-dd_HH-mm-ss').zip"
    Compress-Archive -Path "$backupDir\*" -DestinationPath $zipFile -Force
    Write-Host "✓ 백업 압축 완료: $zipFile" -ForegroundColor Green
    
    # 원본 디렉토리 삭제
    Remove-Item -Path $backupDir -Recurse -Force
    Write-Host "✓ 임시 백업 디렉토리 정리 완료" -ForegroundColor Green
} catch {
    Write-Host "✗ 백업 압축 실패: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "백업 파일은 $backupDir 에 저장되었습니다." -ForegroundColor Yellow
}

Write-Host "`n=== 백업 완료 ===" -ForegroundColor Green
Write-Host "백업 위치: $backupDir" -ForegroundColor Cyan
Write-Host "압축 파일: $zipFile" -ForegroundColor Cyan
Write-Host "백업 크기: $((Get-ChildItem -Path $backupDir -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB) MB" -ForegroundColor Cyan
