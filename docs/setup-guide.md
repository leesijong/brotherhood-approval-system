# 개발 환경 설정 가이드

> ✅ **현재 상태**: Railway 프로덕션 배포 완료, 로컬 개발 환경 완전 구축

## 🚨 중요: PowerShell 사용 및 명령어 실행 규칙

### 🖥️ **터미널 환경**
- **사용 터미널**: PowerShell (Windows Terminal + PowerShell 권장)
- **스크립트 활용**: 프로젝트 루트의 PowerShell 스크립트 사용 필수
- **자세한 내용**: [scripts-guide.md](scripts-guide.md) 참조

### ⚠️ **PowerShell 사용 시 주의사항**
- **`&&` 연산자 미지원**: PowerShell에서는 `&&` 연산자가 작동하지 않음
- **대안**: `;` 또는 각 명령어를 개별 실행
- **예시**:
  ```powershell
  # ❌ 잘못된 방법
  cd backend && gradle bootRun
  
  # ✅ 올바른 방법
  cd backend
  gradle bootRun
  ```

### 프로젝트 실행 규칙
```powershell
# 백엔드 실행 - 반드시 backend 디렉토리에서
cd C:\cckbm\backend
gradle bootRun

# 프론트엔드 실행 - 반드시 brotherhood 디렉토리에서
cd C:\cckbm\brotherhood
npm run dev

# 데이터베이스 작업
cd C:\cckbm
psql -U postgres -d approval_system_dev
```

> **⚠️ 절대 금지사항**: 
> 1. 상위 디렉토리(`C:\cckbm`)에서 `npm run dev` 실행 금지
> 2. 디렉토리 이동 없이 명령어 실행 금지
> 3. 수동 명령어 대신 제공된 스크립트 사용 권장

---

## 📋 필수 요구사항

### 1. Java 개발 환경 ✅
- **Java 17 LTS** (Eclipse Adoptium JDK)
  - 설치 경로: `C:\Program Files\Eclipse Adoptium\jdk-17.0.16.8-hotspot`
- **Gradle 8.5**
  - 설치 경로: `C:\gradle-8.5`

### 2. 데이터베이스 ✅
- **PostgreSQL 17**
  - 포트: 5432
  - 사용자: postgres
  - 비밀번호: postgres
  - 데이터베이스: `approval_system_dev`
- **pgAdmin 4** (선택적, DB 관리용)

### 3. 개발 도구
- **IntelliJ IDEA** (권장) 또는 **VS Code**
- **Git** (버전 관리)
- **Node.js 18.x** (프론트엔드 개발용)
- **npm 또는 yarn** (패키지 관리)
- **Docker Desktop** (선택적, 컨테이너 실행용)

---

## 🔧 설치 및 설정

### 1. Java 17 설치

#### Windows
```powershell
# 다운로드: https://adoptium.net/
# Eclipse Adoptium Temurin 17 JDK 설치

# 설치 확인
java -version
# 출력: openjdk version "17.0.16.8" 2024-09-17
```

#### macOS
```bash
# Homebrew 사용
brew install openjdk@17

# 환경변수 설정
echo 'export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"' >> ~/.zshrc
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install openjdk-17-jdk
```

---

### 2. Gradle 8.5 설치

#### Windows
```powershell
# 다운로드: https://gradle.org/releases/
# gradle-8.5-bin.zip 다운로드 및 C:\gradle-8.5에 압축 해제

# 설치 확인
gradle --version
```

---

### 3. PostgreSQL 17 설치

#### Windows
```powershell
# 다운로드: https://www.postgresql.org/download/windows/
# PostgreSQL 17 설치 프로그램 실행

# 설치 시 설정:
# - 포트: 5432
# - 사용자: postgres
# - 비밀번호: postgres

# 설치 확인
psql --version
# 출력: psql (PostgreSQL) 17.0
```

#### macOS
```bash
# Homebrew 사용
brew install postgresql@17

# 서비스 시작
brew services start postgresql@17
```

#### Linux (Ubuntu/Debian)
```bash
# PostgreSQL 공식 저장소 추가
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
echo "deb http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -cs)-pgdg main" | sudo tee /etc/apt/sources.list.d/pgdg.list

# PostgreSQL 설치
sudo apt update
sudo apt install postgresql-17 postgresql-client-17
```

---

### 4. 환경 변수 설정

#### PowerShell 프로필 설정 (Windows 권장)
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
`$env:PGPASSWORD = "postgres"
`$env:SPRING_PROFILES_ACTIVE = "dev"

Write-Host "✅ Brotherhood Approval System 환경이 설정되었습니다." -ForegroundColor Green
"@

# 프로필에 설정 저장
$profileContent | Out-File -FilePath $PROFILE -Encoding UTF8 -Force

# 즉시 적용
. $PROFILE
```

#### 시스템 환경 변수 설정 (선택사항)
1. **시스템 속성** → **고급** → **환경 변수**
2. **시스템 변수**에서 **Path** 편집
3. 다음 경로 추가:
   - `C:\gradle-8.5\bin`
   - `C:\Program Files\Eclipse Adoptium\jdk-17.0.16.8-hotspot\bin`
4. **새 변수** 추가:
   - `JAVA_HOME`: `C:\Program Files\Eclipse Adoptium\jdk-17.0.16.8-hotspot`
   - `PGCLIENTENCODING`: `UTF8`

---

### 5. 데이터베이스 설정

#### 데이터베이스 생성
```sql
-- psql 명령어로 postgres에 접속
psql -U postgres -d postgres

-- 데이터베이스 생성
CREATE DATABASE approval_system_dev;

-- 권한 부여
GRANT ALL PRIVILEGES ON DATABASE approval_system_dev TO postgres;

-- 연결 확인
\c approval_system_dev

-- 테이블 목록 확인
\dt
```

#### .pgpass 파일 설정 (Windows)
```powershell
# .pgpass 파일 생성 (비밀번호 자동 입력)
$pgpassContent = "localhost:5432:approval_system_dev:postgres:postgres`nlocalhost:5432:postgres:postgres:postgres"
$pgpassPath = "$env:APPDATA\postgresql\pgpass.conf"
New-Item -ItemType Directory -Force -Path (Split-Path $pgpassPath)
Set-Content -Path $pgpassPath -Value $pgpassContent -Encoding ASCII

# 파일 권한 설정
icacls $pgpassPath /inheritance:r /grant:r "$env:USERNAME`:F"
```

---

## 🚀 프로젝트 실행

### 방법 1: 통합 스크립트 사용 (권장)

```powershell
# 프로젝트 루트에서 전체 시스템 시작
cd C:\cckbm
.\start-system.ps1

# 시스템 상태 확인
.\check-system.ps1

# 시스템 중지
.\stop-system.ps1
```

### 방법 2: 수동 실행

#### 백엔드 실행
```powershell
# 백엔드 디렉토리로 이동
cd C:\cckbm\backend

# 빌드 및 실행
gradle clean build -x test
gradle bootRun

# 확인: http://localhost:8080/api/health
```

#### 프론트엔드 실행 (새 터미널)
```powershell
# 프론트엔드 디렉토리로 이동
cd C:\cckbm\brotherhood

# 의존성 설치 (최초 1회)
npm install --legacy-peer-deps

# 개발 서버 실행
npm run dev

# 확인: http://localhost:3000
```

---

## 🔗 접속 URL

| 서비스 | URL | 설명 |
|--------|-----|------|
| **프론트엔드** | http://localhost:3000 | Next.js 개발 서버 |
| **백엔드 API** | http://localhost:8080/api | Spring Boot API |
| **Swagger UI** | http://localhost:8080/swagger-ui.html | API 문서 |
| **Health Check** | http://localhost:8080/api/health | 서버 상태 확인 |

---

## 🛠️ 개발 도구 설정

### IntelliJ IDEA
1. **프로젝트 열기**: `backend/` 디렉토리를 프로젝트로 열기
2. **Gradle 설정**: Gradle Wrapper 사용 설정
3. **데이터베이스 연결**: Database 도구에서 PostgreSQL 연결
4. **Run Configuration**: Spring Boot 애플리케이션 실행 설정

### VS Code
1. **확장 프로그램 설치**:
   - Extension Pack for Java
   - Spring Boot Extension Pack
   - PostgreSQL
2. **설정 파일**: `.vscode/settings.json`에 Java 설정 추가

---

## 🐳 Docker 사용 (선택적)

### docker-compose.yml
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:17
    environment:
      POSTGRES_DB: approval_system_dev
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      SPRING_PROFILES_ACTIVE: dev
      DB_URL: jdbc:postgresql://postgres:5432/approval_system_dev
      DB_USERNAME: postgres
      DB_PASSWORD: postgres
    depends_on:
      - postgres

volumes:
  postgres_data:
```

### Docker 실행
```powershell
# 전체 스택 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f app

# 중지
docker-compose down
```

---

## ❗ 문제 해결

### 1. PostgreSQL 연결 실패
```powershell
# PostgreSQL 서비스 상태 확인 (Windows)
sc query postgresql-x64-17

# 서비스 시작
net start postgresql-x64-17

# 연결 테스트
psql -U postgres -d approval_system_dev -c "SELECT version();"
```

### 2. 포트 충돌
```powershell
# 8080 포트 사용 중인 프로세스 확인
netstat -ano | findstr :8080

# 프로세스 강제 종료 (PID 확인 후)
taskkill /F /PID <PID>

# 3000 포트 확인
netstat -ano | findstr :3000
```

### 3. Gradle 빌드 실패
```powershell
# Gradle 캐시 정리
cd C:\cckbm\backend
gradle clean

# 의존성 새로 다운로드
gradle build --refresh-dependencies
```

### 4. Java를 찾을 수 없음
```powershell
# JAVA_HOME 확인
echo $env:JAVA_HOME

# PATH 확인
echo $env:PATH

# Java 직접 실행 테스트
& "C:\Program Files\Eclipse Adoptium\jdk-17.0.16.8-hotspot\bin\java.exe" -version
```

### 5. 인코딩 오류
```powershell
# PowerShell 인코딩 설정
$env:PGCLIENTENCODING = "UTF8"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
```

---

## 💡 개발 팁

1. **스크립트 사용**: 수동 명령어 대신 제공된 PowerShell 스크립트 활용
2. **TDD 개발**: 백엔드는 테스트 코드를 먼저 작성
3. **Git 브랜치**: 기능별로 브랜치 분리 (`feature/document-management`)
4. **커밋 메시지**: 명확하고 구체적인 커밋 메시지 작성
5. **코드 리뷰**: PR을 통한 코드 리뷰 진행
6. **문서화**: 코드 변경 시 관련 문서도 함께 업데이트

---

## 📚 추가 참고 문서

- [스크립트 사용 가이드](scripts-guide.md)
- [개발 가이드라인](development-guidelines.md)
- [API 명세서](api-specification.md)
- [프로젝트 진행 상황](project-context.md)

---

**마지막 업데이트**: 2025-10-15  
**작성자**: AI Assistant

