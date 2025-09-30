# 로컬 개발 환경 설정 가이드 (2024-09-18 최신 버전)

> ✅ **현재 상태**: 모든 백엔드 환경 구축 완료, Spring Boot 애플리케이션 정상 실행

## 🚨 **중요: Git Bash 사용 및 명령어 실행 위치 규칙**

### 🖥️ **터미널 환경**
- **사용 터미널**: Git Bash (Windows Terminal + Git Bash 권장)
- **설치 확인**: `git --version` (현재: 2.51.0.windows.1)
- **경로**: `C:\Program Files\Git\bin\bash.exe`

### 백엔드 실행
```bash
cd /c/cckbm/backend
./gradlew bootRun
```

### 프론트엔드 실행
```bash
cd /c/cckbm/brotherhood
npm run dev
```

### 데이터베이스 작업
```bash
cd /c/cckbm
psql -U postgres -d approval_system_dev
```

> **⚠️ 주의**: 
> 1. 절대 상위 디렉토리(`/c/cckbm`)에서 `npm run dev` 실행 금지!
> 2. PowerShell 대신 Git Bash 사용 필수
> 3. 경로는 Unix 스타일(`/c/cckbm`) 사용
> 자세한 규칙은 [프로젝트 실행 규칙 문서](project-execution-rules.md)를 참조하세요.

## 필수 요구사항 (✅ 검증 완료)

### 1. Java 개발 환경
- ✅ **Java 17 LTS** (Eclipse Adoptium JDK) - 설치 완료
- ✅ **Gradle 8.5** - 설치 및 PATH 설정 완료

### 2. 데이터베이스
- ✅ **PostgreSQL 17** - 설치 및 설정 완료
- ✅ **approval_system_new** - 데이터베이스 생성 완료
- ✅ **pgAdmin 4** (선택적, DB 관리용)

### 3. 개발 도구
- **IntelliJ IDEA** (권장) 또는 **VS Code**
- ✅ **Git** (버전 관리)
- **Docker Desktop** (선택적, 컨테이너 실행용)
- **Node.js 18.x** (Brotherhood 프론트엔드 개발용)
- **npm 또는 yarn** (패키지 관리)

## 설치 및 설정

### 1. Java 17 설치 (✅ 완료)

#### Windows (현재 설치 완료)
```bash
# ✅ 현재 설치된 버전: Eclipse Adoptium JDK 17.0.16.8
# 설치 경로: C:\Program Files\Eclipse Adoptium\jdk-17.0.16.8-hotspot
# 환경변수: JAVA_HOME 및 PATH 설정 완료

# 설치 확인
java -version
# openjdk version "17.0.16.8" 2024-09-17

# 수동 설치 (참고용)
# https://adoptium.net/ 에서 OpenJDK 17 다운로드
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

### 2. PostgreSQL 17 설치 (✅ 완료)

#### Windows (현재 설치 완료)
```bash
# ✅ 현재 설치된 버전: PostgreSQL 17
# 포트: 5432
# 사용자: postgres (패스워드: postgres)
# 데이터베이스: approval_system_new

# 설치 확인
psql --version
# psql (PostgreSQL) 17.0

# 연결 테스트
psql -h localhost -p 5432 -U postgres -d approval_system_new

# 공식 설치 프로그램 다운로드 (참고용)
# https://www.postgresql.org/download/windows/
```

#### macOS
```bash
# Homebrew 사용
brew install postgresql@16

# 서비스 시작
brew services start postgresql@16
```

#### Linux (Ubuntu/Debian)
```bash
# PostgreSQL 공식 저장소 추가
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
echo "deb http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -cs)-pgdg main" | sudo tee /etc/apt/sources.list.d/pgdg.list

# PostgreSQL 설치
sudo apt update
sudo apt install postgresql-16 postgresql-client-16
```

### 3. 데이터베이스 설정 (✅ 완료)

```sql
-- ✅ 현재 설정 완료된 상태
-- 데이터베이스: approval_system_new
-- 사용자: postgres
-- 패스워드: postgres

-- 기존 설정 (참고용)
-- CREATE DATABASE approval_system_new OWNER postgres;
-- GRANT ALL PRIVILEGES ON DATABASE approval_system_new TO postgres;

-- 연결 확인
\c approval_system_new

-- 현재 테이블 목록 확인
\dt

-- 스키마 정보 확인
\d users
\d documents
\d approval_lines
```

### 4. 프로젝트 설정 (✅ 완료)

#### 환경변수 설정 (PowerShell 프로필에 영구 설정 완료)
```bash
# ✅ Windows (PowerShell 프로필에 설정 완료)
# 위치: C:\Users\ecb69\OneDrive\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1

# 현재 설정된 환경변수들:
$env:PATH += ";C:\gradle-8.5\bin"
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.16.8-hotspot"
$env:PGCLIENTENCODING = "UTF8"
$env:PGPASSWORD = "postgres"

# 애플리케이션 실행용 환경변수
$env:SPRING_PROFILES_ACTIVE="dev"

# macOS/Linux (참고용)
export SPRING_PROFILES_ACTIVE=dev
export JAVA_HOME=/path/to/java17
export PGPASSWORD=postgres
```

#### application-dev.yml 설정 (✅ 현재 적용된 설정)
```yaml
spring:
  application:
    name: approval-system
  profiles:
    active: dev
  datasource:
    url: jdbc:postgresql://localhost:5432/approval_system_new
    username: postgres
    password: postgres
    driver-class-name: org.postgresql.Driver
  
  # JPA Configuration for Development
  jpa:
    hibernate:
      ddl-auto: none # Disable schema validation
    show-sql: true
    properties:
      hibernate:
        format_sql: true
        jdbc:
          time_zone: UTC
  
  # Flyway Configuration
  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true

server:
  port: 8080

logging:
  level:
    com.brotherhood.approval: DEBUG
    org.springframework.security: DEBUG
    org.hibernate.SQL: DEBUG
    org.hibernate.type.descriptor.sql.BasicBinder: TRACE
```

## 개발 워크플로우 (✅ 검증 완료)

### 1. 프로젝트 클론 및 초기 설정 (✅ 완료)
```bash
# ✅ 프로젝트 클론 완료
cd /c/cckbm

# Git Bash에서 Gradle 실행 (Gradle Wrapper 사용)
# 현재 디렉토리 확인
pwd

# 백엔드 디렉토리로 이동
cd backend

# 의존성 다운로드 및 컴파일
./gradlew clean build
```

### 2. 데이터베이스 마이그레이션 (✅ 완료)
```bash
# ✅ Flyway 마이그레이션 성공적으로 적용됨
# 현재 적용된 마이그레이션:
# - V1__init.sql (스키마 생성)
# - V2__seed_data.sql (기본 데이터)

# 마이그레이션 상태 확인
./gradlew flywayInfo

# Spring Boot 애플리케이션 실행 시 자동 마이그레이션
./gradlew bootRun
```

### 3. 애플리케이션 실행 (✅ 성공)
```bash
# ✅ 개발 모드로 실행 성공
cd /c/cckbm/backend
./gradlew bootRun

# ✅ 애플리케이션 확인
# - 서버 포트: http://localhost:8080
# - Spring Boot Admin: http://localhost:8080/actuator
# - API 문서: http://localhost:8080/swagger-ui.html

# ✅ API 엔드포인트 테스트 성공 (2024-09-19)
# - /api/health - 헬스 체크 (200 OK)
# - /api/test - Hello World 테스트 (200 OK)
# - /api/hello - 간단한 인사말 (200 OK)

# 프로세스 확인
netstat -ano | findstr :8080
Get-Process | Where-Object {$_.ProcessName -eq "java"}
```

#### 3.1 API 테스트 방법 ✅ **2024-09-19 완료**
```bash
# 터미널에서 직접 테스트
curl http://localhost:8080/api/health
curl http://localhost:8080/api/test
curl http://localhost:8080/api/hello

# 또는 웹 브라우저에서
# http://localhost:3000/api-test 페이지에서 "모든 테스트 실행" 버튼 클릭
```

### 4. 프론트엔드 개발 (Brotherhood) ✅ **2024-09-19 완료**
```bash
# Brotherhood 프론트엔드 디렉토리로 이동
cd /c/cckbm/brotherhood

# 의존성 설치 (peer dependency 충돌 해결)
npm install --legacy-peer-deps

# 개발 서버 실행
npm run dev

# ✅ 정상 실행 확인
# - 프론트엔드: http://localhost:3000
# - API 테스트: http://localhost:3000/api-test
# - 백엔드 연동: CORS 정책 설정 완료

# 개발 중 실시간 변경사항 확인을 위해
# 브라우저 새로고침 또는 Live Server 사용
```

#### 4.1 프론트엔드 구현 완료 사항 ✅ **2024-09-19**
- **Next.js 14 App Router** 설정 완료
- **React 19** + **TypeScript** 설정 완료
- **Tailwind CSS 4.1.9** + **shadcn/ui** 설정 완료
- **Geist 폰트** 설정 완료
- **Zustand 상태 관리** 구현 완료
- **Axios + React Query** API 클라이언트 구현 완료
- **인증/권한 시스템** (JWT, RBAC+ABAC) 구현 완료
- **Brotherhood 디자인 시스템** 구현 완료
- **API 테스트 페이지** 구현 완료

## Docker를 사용한 로컬 개발 (선택적)

### docker-compose.yml
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: approval_system_dev
      POSTGRES_USER: approval_user
      POSTGRES_PASSWORD: approval_password
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
      DB_USERNAME: approval_user
      DB_PASSWORD: approval_password
    depends_on:
      - postgres

volumes:
  postgres_data:
```

### Docker 실행
```bash
# 전체 스택 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f app

# 중지
docker-compose down
```

## 개발 도구 설정

### IntelliJ IDEA 설정
1. **프로젝트 열기**: `backend/` 디렉토리를 프로젝트로 열기
2. **Gradle 설정**: Gradle Wrapper 사용 설정
3. **데이터베이스 연결**: Database 도구에서 PostgreSQL 연결 설정
4. **Run Configuration**: Spring Boot 애플리케이션 실행 설정

### VS Code 설정
1. **확장 프로그램 설치**:
   - Extension Pack for Java
   - Spring Boot Extension Pack
   - PostgreSQL
2. **설정 파일**: `.vscode/settings.json`에 Java 설정 추가

## 문제 해결

### 일반적인 문제들

#### 1. PostgreSQL 연결 실패
```bash
# PostgreSQL 서비스 상태 확인
# Windows
sc query postgresql-x64-16

# macOS
brew services list | grep postgresql

# Linux
sudo systemctl status postgresql
```

#### 2. 포트 충돌
```bash
# 8080 포트 사용 중인 프로세스 확인
netstat -ano | findstr :8080  # Windows
lsof -i :8080                 # macOS/Linux
```

#### 3. Gradle 빌드 실패
```bash
# Gradle 캐시 정리
./gradlew clean

# 의존성 새로 다운로드
./gradlew build --refresh-dependencies
```

## 개발 팁

1. **TDD 개발**: 테스트 코드를 먼저 작성하고 구현
2. **Git 브랜치**: 기능별로 브랜치 분리 (`feature/document-management`)
3. **커밋 메시지**: 명확하고 구체적인 커밋 메시지 작성
4. **코드 리뷰**: PR을 통한 코드 리뷰 진행
5. **문서화**: 코드 변경 시 관련 문서도 함께 업데이트
