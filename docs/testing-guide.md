# 테스트 환경 가이드 (2024-09-18)

> ✅ **현재 상태**: ApplicationContext 로딩 성공, H2 인메모리 DB 테스트 환경 구축 완료

## 테스트 환경 개요

### 완료된 설정
- ✅ **ApplicationContext 로딩**: Spring Boot 테스트 컨텍스트 정상 시작
- ✅ **H2 인메모리 데이터베이스**: PostgreSQL 호환 모드로 설정
- ✅ **JPA DDL**: 테스트마다 테이블 자동 생성/삭제 (`create-drop`)
- ✅ **Flyway 비활성화**: 테스트에서는 JPA 스키마 생성 사용
- ✅ **테스트 프로파일**: `application-test.yml` 독립 설정

## 테스트 설정 파일

### application-test.yml
```yaml
spring:
  application:
    name: approval-system-test
  
  # 테스트용 인메모리 데이터베이스 설정
  datasource:
    url: jdbc:h2:mem:testdb;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE
    username: sa
    password: 
    driver-class-name: org.h2.Driver
  
  # JPA 설정
  jpa:
    hibernate:
      ddl-auto: create-drop
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.H2Dialect
    defer-datasource-initialization: true

# SQL 초기화 비활성화 (테스트에서 직접 데이터 설정)
  
  # Flyway 비활성화
  flyway:
    enabled: false

# 로깅 설정 (최소화)
logging:
  level:
    com.brotherhood.approval: INFO
    root: WARN
```

### build.gradle 테스트 의존성
```gradle
dependencies {
    // Testing
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
    testImplementation 'com.h2database:h2'
    testImplementation 'org.springframework.security:spring-security-test'
    testImplementation 'org.testcontainers:junit-jupiter'
    testImplementation 'org.testcontainers:postgresql'
}
```

## 테스트 실행 방법

### 1. 기본 컨텍스트 테스트
```bash
# 백엔드 디렉토리에서 실행
cd C:\cckbm\backend

# 모든 테스트 실행
gradle test

# 특정 테스트 클래스 실행
gradle test --tests AccessControlTests

# 테스트 결과 확인
# 결과 위치: build/reports/tests/test/index.html
```

### 2. 개별 테스트 실행
```bash
# 결재선 정책 테스트
gradle test --tests ApprovalPolicyTests

# 문서 접근제어 테스트
gradle test --tests AccessControlTests

# 감사 로그 테스트
gradle test --tests AuditLogTests

# 지사 교차 결재 테스트
gradle test --tests CrossBranchApprovalTests

# 사용자 서비스 테스트
gradle test --tests UserServiceTests

# 문서 서비스 테스트
gradle test --tests DocumentServiceTests
```

## 테스트 작성 규칙

### 1. 기본 테스트 클래스 구조
```java
package com.brotherhood.approval;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

/**
 * 테스트 클래스 설명
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class YourServiceTest {

    @BeforeEach
    void setUp() {
        // 테스트 데이터 설정
    }

    @Test
    @DisplayName("테스트 시나리오 설명")
    void testMethod_WhenCondition_ShouldExpectedResult() {
        // Given
        // 테스트 데이터 준비
        
        // When
        // 실행
        
        // Then
        // 검증
    }
}
```

### 2. 테스트 데이터 설정 예시
```java
@BeforeEach
void setUp() {
    // 지사 생성
    Branch branch = Branch.builder()
        .name("테스트지사")
        .code("TEST")
        .description("테스트용 지사")
        .isActive(true)
        .build();
    branchRepository.save(branch);

    // 역할 생성
    Role role = Role.builder()
        .name("USER")
        .description("일반 사용자")
        .permissions("{\"read\": true, \"write\": true}")
        .isActive(true)
        .build();
    roleRepository.save(role);

    // 사용자 생성
    User user = User.builder()
        .employeeId("EMP001")
        .username("testuser")
        .password("password")
        .fullName("테스트사용자")
        .email("test@example.com")
        .branch(branch)
        .isActive(true)
        .build();
    userRepository.save(user);
}
```

## 현재 테스트 상태

### ✅ 성공하는 테스트
- **ApplicationContext 로딩**: Spring Boot 컨텍스트 정상 시작
- **H2 데이터베이스 연결**: 인메모리 DB 정상 작동
- **JPA 엔티티 생성**: 모든 테이블 자동 생성

### ⚠️ 해결 필요한 테스트
- **기존 비즈니스 로직 테스트**: NullPointerException (테스트 데이터 부족)
- **Repository 테스트**: 실제 데이터 조회 로직 검증 필요
- **Service 레이어 테스트**: Mock 데이터 또는 실제 데이터 구성 필요

## 테스트 패턴 권장사항

### 1. 단위 테스트 (Unit Test)
```java
@ExtendWith(MockitoExtension.class)
class UserServiceUnitTest {
    
    @Mock
    private UserRepository userRepository;
    
    @InjectMocks
    private UserService userService;
    
    @Test
    void createUser_ValidInput_ReturnsUserDto() {
        // Given
        given(userRepository.save(any(User.class)))
            .willReturn(savedUser);
        
        // When & Then
        assertThat(result).isNotNull();
    }
}
```

### 2. 통합 테스트 (Integration Test)
```java
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class UserServiceIntegrationTest {
    
    @Autowired
    private UserService userService;
    
    @Test
    void createUser_WithRealDatabase_Success() {
        // Given
        UserCreateRequest request = createValidRequest();
        
        // When
        UserDto result = userService.createUser(request);
        
        // Then
        assertThat(result.getId()).isNotNull();
    }
}
```

### 3. Repository 테스트
```java
@DataJpaTest
@ActiveProfiles("test")
class UserRepositoryTest {
    
    @Autowired
    private TestEntityManager entityManager;
    
    @Autowired
    private UserRepository userRepository;
    
    @Test
    void findByUsername_ExistingUser_ReturnsUser() {
        // Given
        User user = createTestUser();
        entityManager.persistAndFlush(user);
        
        // When
        Optional<User> result = userRepository.findByUsername("testuser");
        
        // Then
        assertThat(result).isPresent();
        assertThat(result.get().getUsername()).isEqualTo("testuser");
    }
}
```

## 테스트 디버깅

### 1. 테스트 실패 시 확인 사항
```bash
# 상세한 로그로 테스트 실행
gradle test --info

# 특정 테스트 디버그 모드
gradle test --tests YourTest --debug

# 테스트 리포트 확인
open build/reports/tests/test/index.html
```

### 2. H2 콘솔 활용 (선택적)
```yaml
# application-test.yml에 추가 (디버깅용)
spring:
  h2:
    console:
      enabled: true
      path: /h2-console
```

### 3. 테스트 데이터 확인
```java
@Test
void debugTestData() {
    // 테스트 실행 중 데이터 확인
    List<User> users = userRepository.findAll();
    System.out.println("User count: " + users.size());
    users.forEach(user -> 
        System.out.println("User: " + user.getUsername()));
}
```

## 다음 단계

### 1. 테스트 데이터 Builder 패턴 구현
- `UserTestDataBuilder`
- `DocumentTestDataBuilder`
- `ApprovalLineTestDataBuilder`

### 2. 테스트 유틸리티 클래스 구현
- `TestDataFactory`
- `AssertionHelper`
- `MockDataGenerator`

### 3. 테스트 커버리지 개선
- 서비스 레이어 테스트 완성
- 컨트롤러 레이어 테스트 추가
- 보안 테스트 추가

---

이 가이드를 따라 안정적이고 신뢰할 수 있는 테스트 환경을 구축할 수 있습니다.
