# Java 17 설치 스크립트 (Windows PowerShell)

Write-Host "Java 17 설치를 시작합니다..." -ForegroundColor Green

# Chocolatey가 설치되어 있는지 확인
if (Get-Command choco -ErrorAction SilentlyContinue) {
    Write-Host "Chocolatey를 사용하여 Java 17을 설치합니다..." -ForegroundColor Yellow
    choco install openjdk17 -y
} else {
    Write-Host "Chocolatey가 설치되어 있지 않습니다." -ForegroundColor Red
    Write-Host "다음 방법 중 하나를 선택하세요:" -ForegroundColor Yellow
    Write-Host "1. Chocolatey 설치: https://chocolatey.org/install" -ForegroundColor Cyan
    Write-Host "2. 수동 설치: https://adoptium.net/temurin/releases/?version=17" -ForegroundColor Cyan
    Write-Host "3. 이 스크립트를 실행하여 자동 설치를 시도합니다." -ForegroundColor Cyan
    
    # 자동 설치 시도
    try {
        Set-ExecutionPolicy Bypass -Scope Process -Force
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
        iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
        
        Write-Host "Chocolatey 설치 완료. Java 17을 설치합니다..." -ForegroundColor Green
        choco install openjdk17 -y
    } catch {
        Write-Host "자동 설치에 실패했습니다. 수동으로 설치해주세요." -ForegroundColor Red
        Write-Host "다운로드 링크: https://adoptium.net/temurin/releases/?version=17" -ForegroundColor Cyan
    }
}

# 환경변수 설정 확인
Write-Host "`n환경변수 설정을 확인합니다..." -ForegroundColor Yellow
$javaHome = [Environment]::GetEnvironmentVariable("JAVA_HOME", "Machine")
if ($javaHome) {
    Write-Host "JAVA_HOME이 설정되어 있습니다: $javaHome" -ForegroundColor Green
} else {
    Write-Host "JAVA_HOME이 설정되어 있지 않습니다." -ForegroundColor Red
    Write-Host "JAVA_HOME을 수동으로 설정해주세요." -ForegroundColor Yellow
}

Write-Host "`n설치 완료 후 새 터미널을 열어주세요." -ForegroundColor Green
