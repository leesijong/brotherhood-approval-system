# 프론트엔드 시작 스크립트
# Next.js 애플리케이션을 시작합니다

param(
    [switch]$Install = $false,
    [switch]$NoExit
)

# 색상 정의
$Green = "Green"
$Red = "Red"
$Yellow = "Yellow"
$Blue = "Blue"

$frontendPath = "C:\cckbm\brotherhood"

Write-Host "=== 프론트엔드 시작 ===" -ForegroundColor $Blue

# 디렉토리 존재 확인
if (-not (Test-Path $frontendPath)) {
    Write-Host "❌ 프론트엔드 디렉토리를 찾을 수 없습니다: $frontendPath" -ForegroundColor $Red
    if (-not $NoExit) {
        Read-Host "Enter 키를 눌러 종료하세요"
        exit 1
    }
    return
}

# 디렉토리 이동
Set-Location $frontendPath
Write-Host "프론트엔드 디렉토리로 이동: $(Get-Location)" -ForegroundColor $Yellow

# Node.js 버전 확인
try {
    $nodeVersion = node --version
    $npmVersion = npm --version
    Write-Host "Node.js 버전: $nodeVersion" -ForegroundColor $Cyan
    Write-Host "npm 버전: $npmVersion" -ForegroundColor $Cyan
} catch {
    Write-Host "❌ Node.js가 설치되지 않았거나 PATH에 없습니다." -ForegroundColor $Red
    if (-not $NoExit) {
        Read-Host "Enter 키를 눌러 종료하세요"
        exit 1
    }
    return
}

# npm 의존성 설치
if ($Install -or -not (Test-Path "node_modules")) {
    Write-Host "npm 의존성 설치 중..." -ForegroundColor $Yellow
    npm install
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ npm install 실패!" -ForegroundColor $Red
        if (-not $NoExit) {
            Read-Host "Enter 키를 눌러 종료하세요"
            exit 1
        }
        return
    }
    
    Write-Host "✅ npm install 완료!" -ForegroundColor $Green
}

# 개발 서버 시작
Write-Host "Next.js 개발 서버 시작..." -ForegroundColor $Yellow
Write-Host "프론트엔드 URL: http://localhost:3000" -ForegroundColor $Cyan
Write-Host ""

npm run dev

Write-Host "=== 프론트엔드 종료 ===" -ForegroundColor $Blue
