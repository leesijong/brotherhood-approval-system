# 로컬 개발 환경 설정 가이드

## 필수 요구사항

### 1. Java 개발 환경
- **Java 17 LTS** (OpenJDK 또는 Oracle JDK)
- **Gradle 8.x** (Gradle Wrapper 사용 권장)

### 2. 데이터베이스
- **PostgreSQL 16.x** (로컬 설치)
- **pgAdmin 4** (선택적, DB 관리용)

### 3. 개발 도구
- **IntelliJ IDEA** (권장) 또는 **VS Code**
- **Git** (버전 관리)
- **Docker Desktop** (선택적, 컨테이너 실행용)
- **Node.js 18.x** (Brotherhood 프론트엔드 개발용)
- **npm 또는 yarn** (패키지 관리)

## 설치 및 설정

### 1. Java 17 설치

#### Windows
```bash
# Chocolatey 사용
choco install openjdk17

# 또는 수동 설치
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

### 2. PostgreSQL 16 설치

#### Windows
```bash
# Chocolatey 사용
choco install postgresql16

# 또는 공식 설치 프로그램 다운로드
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

### 3. 데이터베이스 설정

```sql
-- PostgreSQL에 접속 후 실행
-- 사용자 생성
CREATE USER approval_user WITH PASSWORD 'approval_password';

-- 데이터베이스 생성
CREATE DATABASE approval_system_dev OWNER approval_user;

-- 권한 부여
GRANT ALL PRIVILEGES ON DATABASE approval_system_dev TO approval_user;

-- 연결 확인
\c approval_system_dev
```

### 4. 프로젝트 설정

#### 환경변수 설정
```bash
# Windows (PowerShell)
$env:SPRING_PROFILES_ACTIVE="dev"
$env:DB_URL="jdbc:postgresql://localhost:5432/approval_system_dev"
$env:DB_USERNAME="approval_user"
$env:DB_PASSWORD="approval_password"

# macOS/Linux
export SPRING_PROFILES_ACTIVE=dev
export DB_URL=jdbc:postgresql://localhost:5432/approval_system_dev
export DB_USERNAME=approval_user
export DB_PASSWORD=approval_password
```

#### application-dev.yml 설정
```yaml
spring:
  datasource:
    url: ${DB_URL:jdbc:postgresql://localhost:5432/approval_system_dev}
    username: ${DB_USERNAME:approval_user}
    password: ${DB_PASSWORD:approval_password}
    driver-class-name: org.postgresql.Driver
  
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true
  
  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true

server:
  port: 8080

logging:
  level:
    com.cckbm.approval: DEBUG
    org.springframework.security: DEBUG
```

## 개발 워크플로우

### 1. 프로젝트 클론 및 초기 설정
```bash
# 프로젝트 클론
git clone <repository-url>
cd cckbm

# Gradle Wrapper 권한 설정 (Linux/macOS)
chmod +x gradlew

# 의존성 다운로드
./gradlew build
```

### 2. 데이터베이스 마이그레이션
```bash
# Flyway 마이그레이션 실행
./gradlew flywayMigrate

# 또는 Spring Boot 애플리케이션 실행 시 자동 실행
./gradlew bootRun
```

### 3. 애플리케이션 실행
```bash
# 개발 모드로 실행
./gradlew bootRun

# 또는 JAR 파일로 실행
./gradlew build
java -jar backend/build/libs/approval-system-0.0.1-SNAPSHOT.jar
```

### 4. 프론트엔드 개발
```bash
# 정적 파일은 Spring Boot에서 자동 서빙
# http://localhost:8080 에서 접근 가능

# 개발 중 실시간 변경사항 확인을 위해
# 브라우저 새로고침 또는 Live Server 사용
```

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
