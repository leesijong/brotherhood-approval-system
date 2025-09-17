# 기술 스택 및 의존성 명세

## 프론트엔드 기술 스택

### 1. UI/UX 기술 (Brotherhood 디자인 시스템)
- **프레임워크**: Next.js 14.2.25 + React 19
- **CSS Framework**: Tailwind CSS 4.1.9 + shadcn/ui
- **UI 컴포넌트**: Radix UI (완전한 접근성 지원)
- **아이콘**: Lucide React 0.454.0
- **폰트**: Geist (현대적인 폰트)
- **빌드 도구**: Next.js 내장 빌드 시스템

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

## 백엔드 기술 스택

### 1. 핵심 프레임워크
- **Spring Boot**: `3.2.0`
- **Spring Framework**: `6.1.0`
- **Java**: `17 LTS` (OpenJDK 권장)

### 2. 데이터베이스 및 ORM
- **PostgreSQL**: `16.1`
- **Spring Data JPA**: `3.2.0`
- **Hibernate**: `6.4.0.Final`
- **Flyway**: `10.0.0` (데이터베이스 마이그레이션)

### 3. 보안
- **Spring Security**: `6.2.0`
- **Spring Security OAuth2**: `3.2.0`
- **JWT**: `0.12.3` (JSON Web Token)

### 4. API 문서화
- **Springdoc OpenAPI**: `2.3.0`
- **Swagger UI**: `2.3.0`

### 5. 유틸리티 및 매핑
- **MapStruct**: `1.5.5.Final` (DTO 매핑)
- **Lombok**: `1.18.30` (코드 간소화)
- **Jackson**: `2.16.0` (JSON 처리)

### 6. 테스트
- **JUnit 5**: `5.10.1`
- **Spring Boot Test**: `3.2.0`
- **Testcontainers**: `1.19.3` (통합 테스트)
- **Mockito**: `5.7.0`

### 7. 빌드 도구
- **Gradle**: `8.5`
- **Gradle Wrapper**: `8.5`

## 프론트엔드 기술 스택

### 1. 핵심 라이브러리
- **jQuery**: `3.7.1`
- **Bootstrap**: `5.3.2` (선택적)
- **Axios**: `1.6.2` (HTTP 클라이언트)

### 2. UI/UX
- **CSS3** (순수 CSS)
- **HTML5** (시맨틱 마크업)
- **JavaScript ES6+**

### 3. 파일 처리
- **FileSaver.js**: `2.0.5` (파일 다운로드)
- **jsPDF**: `2.5.1` (PDF 생성, 선택적)

## 데이터베이스

### PostgreSQL 설정
```sql
-- 버전: PostgreSQL 16.1
-- 인코딩: UTF-8
-- 로케일: ko_KR.UTF-8
-- 타임존: Asia/Seoul
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

### 개발 환경 (application-dev.yml)
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/approval_system_dev
    username: approval_user
    password: approval_password
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

logging:
  level:
    com.cckbm.approval: DEBUG
    org.springframework.security: DEBUG
    org.hibernate.SQL: DEBUG
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
- **CORS**: 적절한 CORS 정책 설정

### 3. 모니터링
- **Actuator**: Spring Boot Actuator
- **로깅**: SLF4J + Logback
- **메트릭**: Micrometer (Prometheus 연동 가능)
