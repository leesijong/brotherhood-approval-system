# 기술 스택 및 의존성 명세 (2025-09-22 현행화)

> ✅ **현재 상태**: 모든 기술 스택 구축 완료, UUID 기반 설계 완료, 실제 API 연동 완료

## 백엔드 기술 스택 (✅ 완료)

### 1. 핵심 프레임워크
- ✅ **Spring Boot**: `3.2.0` - 성공적으로 실행 중
- ✅ **Spring Framework**: `6.1.0`
- ✅ **Java**: `17 LTS` (Eclipse Adoptium JDK 17.0.16.8) - 설치 완료

### 2. 데이터베이스 및 ORM (✅ 완료)
- ✅ **PostgreSQL**: `17.0` - 설치 및 설정 완료
- ✅ **Spring Data JPA**: `3.2.0` - UUID 기반 엔티티 정상 작동
- ✅ **Hibernate**: `6.4.0.Final` - UUID 스키마 동기화 완료
- ✅ **Flyway**: `10.8.1` - UUID 기반 마이그레이션 성공적으로 적용
- ✅ **UUID 확장**: `uuid-ossp` - PostgreSQL UUID 지원

### 3. 보안 (✅ 완료)
- ✅ **Spring Security**: `6.2.0` - UUID 기반 인증 시스템 완료
- ✅ **Spring Security OAuth2**: `3.2.0`
- ✅ **JWT**: `0.12.3` (JSON Web Token) - UUID 기반 JwtService 구현 완료
- ✅ **BCrypt**: 패스워드 해싱 및 검증 완료

### 4. API 문서화 (✅ 완료)
- ✅ **Springdoc OpenAPI**: `2.3.0` - Swagger UI 설정 완료
- ✅ **Swagger UI**: `2.3.0` - http://localhost:8080/swagger-ui.html

### 5. 유틸리티 및 매핑 (✅ 완료)
- ✅ **MapStruct**: `1.5.5.Final` - 모든 매퍼 구현 완료
- ✅ **Lombok**: `1.18.30` - 코드 생성 정상 작동
- ✅ **Jackson**: `2.16.0` - JSON 처리 완료

### 6. 테스트 (✅ 완료)
- ✅ **JUnit 5**: `5.10.1` - 테스트 환경 구축 완료
- ✅ **Spring Boot Test**: `3.2.0` - ApplicationContext 로딩 성공
- ✅ **H2 Database**: 테스트용 인메모리 DB 설정 완료
- ✅ **Mockito**: `5.7.0`

### 7. 빌드 도구 (✅ 완료)
- ✅ **Gradle**: `8.5` - 설치 및 PATH 설정 완료
- ✅ **Gradle Wrapper**: `8.5` - 멀티프로젝트 구성 완료

## 프론트엔드 기술 스택 (✅ 2024-09-19 구현완료)

### 1. UI/UX 기술 (Brotherhood 디자인 시스템)
- ✅ **프레임워크**: Next.js 14.2.25 + React 19
- ✅ **CSS Framework**: Tailwind CSS 4.1.9 + shadcn/ui
- ✅ **UI 컴포넌트**: Radix UI (완전한 접근성 지원)
- ✅ **아이콘**: Lucide React 0.454.0
- ✅ **폰트**: Geist (현대적인 폰트) ✅ **2024-09-19 완료**
- ✅ **빌드 도구**: Next.js 내장 빌드 시스템
- ✅ **상태 관리**: Zustand ✅ **2024-09-19 완료**
- ✅ **API 클라이언트**: Axios + React Query ✅ **2024-09-19 완료**
- ✅ **인증 시스템**: JWT + RBAC/ABAC ✅ **2024-09-19 완료**
- ✅ **테마 시스템**: next-themes (다크/라이트) ✅ **2024-09-19 완료**

### 2. Brotherhood 디자인 시스템
shadcn/ui 기반의 현대적이고 전문적인 컬러 시스템:

- **메인 컬러**: #7e1416 (레드) - 헤더, 버튼, 강조 요소
- **보조 컬러**: #f59e0b (앰버/오렌지) - 보조 액션
- **카드 배경**: #fef2f2 (연한 레드) - 카드 배경
- **파괴적 컬러**: #dc2626 (빨간색) - 삭제, 경고
- **상태 컬러**: 
  - 승인: #10b981 (에메랄드)
  - 반려: #ef4444 (레드)
  - 진행중: #f59e0b (앰버)

## 프론트엔드 기술 스택

### 1. 핵심 라이브러리
- **React**: `19.0.0`
- **Next.js**: `14.2.25`
- **TypeScript**: `5.x`
- **Axios**: `1.6.2` (HTTP 클라이언트)

### 2. UI/UX
- **Tailwind CSS**: `4.1.9`
- **shadcn/ui**: 최신 버전
- **Radix UI**: 접근성 지원
- **Lucide React**: `0.454.0` (아이콘)

### 3. 파일 처리
- **FileSaver.js**: `2.0.5` (파일 다운로드)
- **jsPDF**: `2.5.1` (PDF 생성, 선택적)

## 데이터베이스 (✅ 완료)

### PostgreSQL 설정 (현재 설치된 버전)
```sql
-- ✅ 버전: PostgreSQL 17.0
-- ✅ 인코딩: UTF-8
-- ✅ 로케일: Korean_Korea.949
-- ✅ 타임존: Asia/Seoul
-- ✅ 포트: 5432
-- ✅ 데이터베이스: approval_system_new
-- ✅ 사용자: postgres
-- ✅ 패스워드: postgres
```

### 주요 확장 기능
- **uuid-ossp**: UUID 생성
- **pgcrypto**: 암호화 함수
- **pg_trgm**: 텍스트 검색

## 개발 도구

### 1. IDE 및 에디터
- **IntelliJ IDEA**: `2023.3+` (권장)
- **VS Code**: `1.85+` (대안)
- **Eclipse**: `2023-12+` (대안)

### 2. 데이터베이스 도구
- **pgAdmin 4**: `8.0+`
- **DBeaver**: `23.3+` (대안)

### 3. API 테스트
- **Postman**: `10.20+`
- **Insomnia**: `2023.5+` (대안)

## Gradle 의존성 상세

### build.gradle (백엔드)
```gradle
plugins {
    id 'java'
    id 'org.springframework.boot' version '3.2.0'
    id 'io.spring.dependency-management' version '1.1.4'
    id 'org.flywaydb.flyway' version '10.0.0'
}

java {
    sourceCompatibility = '17'
    targetCompatibility = '17'
}

repositories {
    mavenCentral()
}

dependencies {
    // Spring Boot Starters
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    implementation 'org.springframework.boot:spring-boot-starter-security'
    implementation 'org.springframework.boot:spring-boot-starter-validation'
    implementation 'org.springframework.boot:spring-boot-starter-mail'
    implementation 'org.springframework.boot:spring-boot-starter-actuator'
    
    // Database
    implementation 'org.postgresql:postgresql:42.7.1'
    implementation 'org.flywaydb:flyway-core:10.0.0'
    implementation 'org.flywaydb:flyway-database-postgresql:10.0.0'
    
    // Security
    implementation 'org.springframework.security:spring-security-oauth2-authorization-server:1.2.0'
    implementation 'io.jsonwebtoken:jjwt-api:0.12.3'
    runtimeOnly 'io.jsonwebtoken:jjwt-impl:0.12.3'
    runtimeOnly 'io.jsonwebtoken:jjwt-jackson:0.12.3'
    
    // API Documentation
    implementation 'org.springdoc:springdoc-openapi-starter-webmvc-ui:2.3.0'
    
    // Mapping
    implementation 'org.mapstruct:mapstruct:1.5.5.Final'
    annotationProcessor 'org.mapstruct:mapstruct-processor:1.5.5.Final'
    
    // Utilities
    compileOnly 'org.projectlombok:lombok:1.18.30'
    annotationProcessor 'org.projectlombok:lombok:1.18.30'
    
    // Development Tools
    developmentOnly 'org.springframework.boot:spring-boot-devtools'
    
    // Testing
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
    testImplementation 'org.springframework.security:spring-security-test'
    testImplementation 'org.testcontainers:junit-jupiter:1.19.3'
    testImplementation 'org.testcontainers:postgresql:1.19.3'
    testImplementation 'org.mockito:mockito-core:5.7.0'
    testImplementation 'org.mockito:mockito-junit-jupiter:5.7.0'
}

tasks.named('test') {
    useJUnitPlatform()
}
```

## 환경별 설정

### 개발 환경 (application-dev.yml) - ✅ 현재 적용된 설정
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

### 운영 환경 (application-prod.yml)
```yaml
spring:
  datasource:
    url: ${DB_URL}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
    driver-class-name: org.postgresql.Driver
  
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect

logging:
  level:
    com.cckbm.approval: INFO
    org.springframework.security: WARN
```

## Docker 설정

### Dockerfile
```dockerfile
FROM openjdk:17-jdk-slim

WORKDIR /app

COPY backend/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
```

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

## 성능 및 보안 고려사항

### 1. 성능 최적화
- **Connection Pool**: HikariCP (Spring Boot 기본)
- **캐싱**: Spring Cache (Redis 연동 가능)
- **인덱싱**: 데이터베이스 인덱스 최적화

### 2. 보안 설정
- **암호화**: AES-256 (문서 저장)
- **전송 보안**: TLS 1.3
- **세션 관리**: HttpOnly, Secure, SameSite 쿠키
- **CORS**: 적절한 CORS 정책 설정 ✅ **2024-09-19 완료** (프론트엔드 연동)

### 3. 모니터링
- **Actuator**: Spring Boot Actuator
- **로깅**: SLF4J + Logback
- **메트릭**: Micrometer (Prometheus 연동 가능)

## 2024-09-19 주요 성과 요약

### ✅ 완료된 기술 스택 구현
1. **전체 백엔드 아키텍처**: 13개 엔티티, 11개 리포지토리, 14개 서비스, 7개 컨트롤러
2. **완전한 데이터베이스 동기화**: PostgreSQL 17과 JPA 엔티티 100% 매핑
3. **테스트 환경 구축**: H2 인메모리 DB, ApplicationContext 로딩 성공
4. **MapStruct + Lombok 통합**: 코드 생성 순서 문제 해결
5. **Spring Security 기본 설정**: 개발 및 테스트 환경 구성
6. **프론트엔드 Brotherhood 구현**: Next.js 14 + React 19 + shadcn/ui ✅ **2024-09-19 완료**
7. **API 연동 성공**: CORS 정책 해결, 프론트엔드-백엔드 통신 완료 ✅ **2024-09-19 완료**

### ✅ 해결된 기술적 도전
1. **Flyway 호환성**: PostgreSQL 17 + Flyway 10.8.1 버전 매칭
2. **Enum to String 마이그레이션**: 확장성과 유지보수성 개선
3. **Repository @Query 최적화**: JPA 메서드 네이밍 문제 해결
4. **Gradle 멀티프로젝트**: Root + backend 서브프로젝트 구성
5. **환경 변수 영구 설정**: PowerShell 프로필 자동화
6. **MapStruct 경고 해결**: 11개 경고 수정 완료 ✅ **2024-09-19 완료**
7. **CORS 정책 설정**: 프론트엔드-백엔드 연동 성공 ✅ **2024-09-19 완료**
8. **API 엔드포인트 테스트**: `/api/health`, `/api/test`, `/api/hello` 정상 작동 ✅ **2024-09-19 완료**

### 🚀 다음 개발 단계
1. **핵심 컴포넌트 구현**: AppLayout, TopNavigation, DashboardSidebar 등
2. **문서 관리 기능**: DocumentList, DocumentForm, DocumentViewer 등
3. **결재 시스템 기능**: ApprovalWorkflow, ApprovalQueue, ApprovalActions 등
4. **Docker 컨테이너화**: 배포 환경 표준화
