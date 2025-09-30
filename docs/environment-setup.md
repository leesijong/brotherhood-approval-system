# 로컬 개발 환경 설정 가이드

## 🖥️ **터미널 환경**
- **사용 터미널**: Git Bash (Windows Terminal + Git Bash 권장)
- **설치 확인**: `git --version` (현재: 2.51.0.windows.1)
- **경로**: `C:\Program Files\Git\bin\bash.exe`

## 필수 소프트웨어 설치

### 1. Java 17
- **설치 경로**: `C:\Program Files\Eclipse Adoptium\jdk-17.0.16.8-hotspot`
- **설치 방법**: Eclipse Adoptium Temurin 17 JDK 다운로드 및 설치
- **확인 명령어**: `java -version`

### 2. Gradle 8.5
- **설치 경로**: `C:\gradle-8.5`
- **설치 방법**: Gradle 8.5 바이너리 다운로드 및 압축 해제
- **확인 명령어**: `gradle --version`

### 3. PostgreSQL 17
- **설치 경로**: `C:\Program Files\PostgreSQL\17`
- **데이터베이스**: `approval_system_dev`
- **사용자**: `postgres` (패스워드: `postgres`)
- **확인 명령어**: `psql -U postgres -d postgres`

## 환경 변수 설정

### PowerShell 프로필 설정
다음 명령어로 PowerShell 프로필에 환경 변수를 영구적으로 설정합니다:

```powershell
# PowerShell 프로필 경로 확인
$PROFILE

# 프로필 디렉토리 생성
New-Item -ItemType Directory -Force -Path (Split-Path $PROFILE)

# 환경 변수 설정 스크립트 생성
$profileContent = @"
# Brotherhood Approval System 환경 설정
`$env:PATH += ";C:\gradle-8.5\bin"
`$env:PATH += ";C:\Program Files\Eclipse Adoptium\jdk-17.0.16.8-hotspot\bin"
`$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.16.8-hotspot"
`$env:PGCLIENTENCODING = "UTF8"

# PostgreSQL 패스워드 설정
`$env:PGPASSWORD = "postgres"

Write-Host "Brotherhood Approval System 환경이 설정되었습니다." -ForegroundColor Green
"@

# 프로필에 설정 저장
$profileContent | Out-File -FilePath $PROFILE -Encoding UTF8 -Force
```

### 시스템 환경 변수 설정 (선택사항)
1. **시스템 속성** → **고급** → **환경 변수**
2. **시스템 변수**에서 **Path** 편집
3. 다음 경로 추가:
   - `C:\gradle-8.5\bin`
   - `C:\Program Files\Eclipse Adoptium\jdk-17.0.16.8-hotspot\bin`
4. **새 변수** 추가:
   - `JAVA_HOME`: `C:\Program Files\Eclipse Adoptium\jdk-17.0.16.8-hotspot`
   - `PGCLIENTENCODING`: `UTF8`

## PostgreSQL 설정

### 1. 데이터베이스 생성
```sql
-- postgres 사용자로 접속
psql -U postgres -d postgres

-- 데이터베이스 생성
CREATE DATABASE approval_system_dev;

-- 사용자 생성 및 권한 부여
CREATE USER approval_user WITH PASSWORD 'approval_password';
GRANT ALL PRIVILEGES ON DATABASE approval_system_dev TO approval_user;
```

### 2. .pgpass 파일 설정
```powershell
# .pgpass 파일 생성
$pgpassContent = "localhost:5432:approval_system_dev:postgres:postgres`nlocalhost:5432:postgres:postgres:postgres"
$pgpassPath = "$env:APPDATA\postgresql\pgpass.conf"
New-Item -ItemType Directory -Force -Path (Split-Path $pgpassPath)
Set-Content -Path $pgpassPath -Value $pgpassContent -Encoding ASCII

# 파일 권한 설정
icacls $pgpassPath /inheritance:r /grant:r "$env:USERNAME`:F"
```

## 프로젝트 실행

### 1. 백엔드 실행
```bash
# 프로젝트 디렉토리로 이동
cd /c/cckbm/backend

# 환경 변수 설정 (프로필이 설정되지 않은 경우)
export PATH="$PATH:/c/gradle-8.5/bin"
export JAVA_HOME="/c/Program Files/Eclipse Adoptium/jdk-17.0.16.8-hotspot"
export PGCLIENTENCODING="UTF8"
export PGPASSWORD="postgres"

# 빌드 및 실행
./gradlew clean build -x test
./gradlew bootRun
```

### 2. 접속 URL
- **API 기본 URL**: `http://localhost:8080/api`
- **Swagger UI**: `http://localhost:8080/api/swagger-ui.html`
- **Health Check**: `http://localhost:8080/api/actuator/health`

## 문제 해결

### 1. Gradle을 찾을 수 없는 경우
```bash
# PATH 확인
echo $PATH

# Gradle 직접 실행
/c/gradle-8.5/bin/gradle --version
```

### 2. Java를 찾을 수 없는 경우
```bash
# JAVA_HOME 확인
echo $JAVA_HOME

# Java 직접 실행
"/c/Program Files/Eclipse Adoptium/jdk-17.0.16.8-hotspot/bin/java.exe" -version
```

### 3. PostgreSQL 연결 오류
```bash
# PostgreSQL 서비스 상태 확인 (Windows 명령어)
sc query postgresql-x64-17

# 연결 테스트
psql -U postgres -d approval_system_dev -c "SELECT version();"
```

### 4. 인코딩 오류
```bash
# Git Bash 인코딩 설정
export LANG=ko_KR.UTF-8
export LC_ALL=ko_KR.UTF-8
export PGCLIENTENCODING="UTF8"
```

## 자동화 스크립트

### start-backend.sh
```bash
#!/bin/bash
# Brotherhood Approval System 백엔드 시작 스크립트
echo "Brotherhood Approval System 백엔드를 시작합니다..."

# 환경 변수 설정
export PATH="$PATH:/c/gradle-8.5/bin"
export JAVA_HOME="/c/Program Files/Eclipse Adoptium/jdk-17.0.16.8-hotspot"
export PGCLIENTENCODING="UTF8"
export PGPASSWORD="postgres"

# 프로젝트 디렉토리로 이동
cd /c/cckbm/backend

# 빌드 및 실행
echo "빌드를 시작합니다..."
./gradlew clean build -x test

if [ $? -eq 0 ]; then
    echo "빌드가 완료되었습니다. 애플리케이션을 시작합니다..."
    ./gradlew bootRun
else
    echo "빌드에 실패했습니다."
fi
```

이제 환경 설정이 완료되었습니다. Git Bash에서 `start-backend.sh` 스크립트를 실행하여 백엔드를 시작할 수 있습니다.
