# PowerShell 프로필 설정 스크립트
# Brotherhood 프로젝트 관련 함수들을 PowerShell 프로필에 추가합니다

# 색상 정의
$Green = "Green"
$Red = "Red"
$Yellow = "Yellow"
$Blue = "Blue"
$Cyan = "Cyan"

Write-Host "=== PowerShell 프로필 설정 ===" -ForegroundColor $Cyan

# PowerShell 프로필 경로 확인
$profilePath = $PROFILE
$profileDir = Split-Path $profilePath -Parent

Write-Host "프로필 경로: $profilePath" -ForegroundColor $Blue

# 프로필 디렉토리 생성
if (-not (Test-Path $profileDir)) {
    Write-Host "프로필 디렉토리 생성 중..." -ForegroundColor $Yellow
    New-Item -ItemType Directory -Path $profileDir -Force | Out-Null
    Write-Host "✅ 프로필 디렉토리 생성 완료" -ForegroundColor $Green
}

# Brotherhood 함수들 정의
$brotherhoodFunctions = @"

# Brotherhood 결재 시스템 함수들
function Start-BrotherhoodSystem {
    <#
    .SYNOPSIS
    Brotherhood 결재 시스템을 시작합니다.
    
    .DESCRIPTION
    백엔드와 프론트엔드를 순차적으로 시작합니다.
    
    .EXAMPLE
    Start-BrotherhoodSystem
    #>
    Set-Location "C:\cckbm"
    .\scripts\master-control.ps1 start
}

function Stop-BrotherhoodSystem {
    <#
    .SYNOPSIS
    Brotherhood 결재 시스템을 중지합니다.
    
    .DESCRIPTION
    실행 중인 모든 서비스를 중지합니다.
    
    .EXAMPLE
    Stop-BrotherhoodSystem
    #>
    Set-Location "C:\cckbm"
    .\scripts\master-control.ps1 stop
}

function Restart-BrotherhoodSystem {
    <#
    .SYNOPSIS
    Brotherhood 결재 시스템을 재시작합니다.
    
    .DESCRIPTION
    모든 서비스를 중지한 후 다시 시작합니다.
    
    .EXAMPLE
    Restart-BrotherhoodSystem
    #>
    Set-Location "C:\cckbm"
    .\scripts\master-control.ps1 restart
}

function Get-BrotherhoodStatus {
    <#
    .SYNOPSIS
    Brotherhood 결재 시스템의 상태를 확인합니다.
    
    .DESCRIPTION
    모든 서비스의 실행 상태를 확인합니다.
    
    .EXAMPLE
    Get-BrotherhoodStatus
    #>
    Set-Location "C:\cckbm"
    .\scripts\check-status.ps1
}

function Connect-BrotherhoodDB {
    <#
    .SYNOPSIS
    Brotherhood 데이터베이스에 연결합니다.
    
    .DESCRIPTION
    PostgreSQL 데이터베이스에 연결합니다.
    
    .EXAMPLE
    Connect-BrotherhoodDB
    #>
    Set-Location "C:\cckbm"
    .\scripts\db-manage.ps1 connect
}

function Start-BrotherhoodBackend {
    <#
    .SYNOPSIS
    Brotherhood 백엔드를 시작합니다.
    
    .DESCRIPTION
    Spring Boot 백엔드 애플리케이션을 시작합니다.
    
    .EXAMPLE
    Start-BrotherhoodBackend
    #>
    Set-Location "C:\cckbm"
    .\scripts\start-backend.ps1
}

function Start-BrotherhoodFrontend {
    <#
    .SYNOPSIS
    Brotherhood 프론트엔드를 시작합니다.
    
    .DESCRIPTION
    Next.js 프론트엔드 애플리케이션을 시작합니다.
    
    .EXAMPLE
    Start-BrotherhoodFrontend
    #>
    Set-Location "C:\cckbm"
    .\scripts\start-frontend.ps1
}

function Set-BrotherhoodDirectory {
    <#
    .SYNOPSIS
    Brotherhood 프로젝트 디렉토리로 이동합니다.
    
    .DESCRIPTION
    C:\cckbm 디렉토리로 이동합니다.
    
    .EXAMPLE
    Set-BrotherhoodDirectory
    #>
    Set-Location "C:\cckbm"
    Write-Host "Brotherhood 프로젝트 디렉토리로 이동: $(Get-Location)" -ForegroundColor Green
}

function Get-BrotherhoodHelp {
    <#
    .SYNOPSIS
    Brotherhood 관련 명령어 도움말을 표시합니다.
    
    .DESCRIPTION
    사용 가능한 모든 Brotherhood 명령어를 표시합니다.
    
    .EXAMPLE
    Get-BrotherhoodHelp
    #>
    Write-Host "=== Brotherhood 결재 시스템 명령어 ===" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "시스템 관리:" -ForegroundColor Yellow
    Write-Host "  Start-BrotherhoodSystem    # 전체 시스템 시작" -ForegroundColor Green
    Write-Host "  Stop-BrotherhoodSystem     # 모든 서비스 중지" -ForegroundColor Red
    Write-Host "  Restart-BrotherhoodSystem  # 전체 시스템 재시작" -ForegroundColor Yellow
    Write-Host "  Get-BrotherhoodStatus      # 시스템 상태 확인" -ForegroundColor Blue
    Write-Host ""
    Write-Host "개별 서비스:" -ForegroundColor Yellow
    Write-Host "  Start-BrotherhoodBackend   # 백엔드만 시작" -ForegroundColor Green
    Write-Host "  Start-BrotherhoodFrontend  # 프론트엔드만 시작" -ForegroundColor Green
    Write-Host ""
    Write-Host "데이터베이스:" -ForegroundColor Yellow
    Write-Host "  Connect-BrotherhoodDB      # 데이터베이스 연결" -ForegroundColor Green
    Write-Host ""
    Write-Host "유틸리티:" -ForegroundColor Yellow
    Write-Host "  Set-BrotherhoodDirectory   # 프로젝트 디렉토리로 이동" -ForegroundColor Green
    Write-Host "  Get-BrotherhoodHelp        # 도움말 표시" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "간단한 별칭:" -ForegroundColor Yellow
    Write-Host "  b-start                    # Start-BrotherhoodSystem" -ForegroundColor Green
    Write-Host "  b-stop                     # Stop-BrotherhoodSystem" -ForegroundColor Red
    Write-Host "  b-status                   # Get-BrotherhoodStatus" -ForegroundColor Blue
    Write-Host "  b-db                       # Connect-BrotherhoodDB" -ForegroundColor Green
    Write-Host "  b-cd                       # Set-BrotherhoodDirectory" -ForegroundColor Green
}

# 별칭 설정
Set-Alias -Name "b-start" -Value "Start-BrotherhoodSystem"
Set-Alias -Name "b-stop" -Value "Stop-BrotherhoodSystem"
Set-Alias -Name "b-restart" -Value "Restart-BrotherhoodSystem"
Set-Alias -Name "b-status" -Value "Get-BrotherhoodStatus"
Set-Alias -Name "b-db" -Value "Connect-BrotherhoodDB"
Set-Alias -Name "b-cd" -Value "Set-BrotherhoodDirectory"
Set-Alias -Name "b-help" -Value "Get-BrotherhoodHelp"

Write-Host "Brotherhood 결재 시스템 함수들이 로드되었습니다." -ForegroundColor Green
Write-Host "사용 가능한 명령어를 보려면 'Get-BrotherhoodHelp' 또는 'b-help'를 입력하세요." -ForegroundColor Yellow

"@

# 기존 프로필 내용 확인
$existingContent = ""
if (Test-Path $profilePath) {
    $existingContent = Get-Content $profilePath -Raw
    Write-Host "기존 프로필 파일 발견" -ForegroundColor $Yellow
} else {
    Write-Host "새 프로필 파일 생성" -ForegroundColor $Yellow
}

# Brotherhood 함수들이 이미 있는지 확인
if ($existingContent -like "*Start-BrotherhoodSystem*") {
    Write-Host "⚠️ Brotherhood 함수들이 이미 프로필에 있습니다." -ForegroundColor $Yellow
    $update = Read-Host "업데이트하시겠습니까? (y/N)"
    
    if ($update -eq "y" -or $update -eq "Y") {
        # 기존 Brotherhood 관련 내용 제거
        $lines = $existingContent -split "`n"
        $newLines = @()
        $skipMode = $false
        
        foreach ($line in $lines) {
            if ($line -like "*# Brotherhood 결재 시스템 함수들*") {
                $skipMode = $true
                continue
            }
            if ($line -like "*Write-Host \"Brotherhood 결재 시스템 함수들이 로드되었습니다.\"*") {
                $skipMode = $false
                continue
            }
            if (-not $skipMode) {
                $newLines += $line
            }
        }
        
        $existingContent = $newLines -join "`n"
        Write-Host "✅ 기존 Brotherhood 함수들 제거 완료" -ForegroundColor $Green
    } else {
        Write-Host "프로필 설정을 취소합니다." -ForegroundColor $Yellow
        exit 0
    }
}

# 프로필 파일에 Brotherhood 함수들 추가
$newContent = $existingContent + "`n`n" + $brotherhoodFunctions

try {
    Set-Content -Path $profilePath -Value $newContent -Encoding UTF8
    Write-Host "✅ PowerShell 프로필 설정 완료!" -ForegroundColor $Green
    Write-Host ""
    Write-Host "프로필이 적용되려면 PowerShell을 재시작하거나 다음 명령어를 실행하세요:" -ForegroundColor $Yellow
    Write-Host "  . `$PROFILE" -ForegroundColor $Cyan
    Write-Host ""
    Write-Host "사용 가능한 명령어:" -ForegroundColor $Yellow
    Write-Host "  Start-BrotherhoodSystem (또는 b-start)" -ForegroundColor $Green
    Write-Host "  Get-BrotherhoodStatus (또는 b-status)" -ForegroundColor $Blue
    Write-Host "  Get-BrotherhoodHelp (또는 b-help)" -ForegroundColor $Cyan
} catch {
    Write-Host "❌ 프로필 설정 실패: $($_.Exception.Message)" -ForegroundColor $Red
    Write-Host "관리자 권한으로 실행해보세요." -ForegroundColor $Yellow
}
