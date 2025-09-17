# 시스템 설계 문서

## 1. 시스템 개요

### 1.1 프로젝트 목적
한국순교복자수도회의 내부 문서 결재 시스템을 전자화하여 투명성과 추적성을 확보하고, 보안과 접근통제를 최우선으로 하는 전자결재 시스템을 구축한다.

### 1.2 핵심 목표
- **보안 우선**: 결재 라인 또는 명시된 권한이 있는 사용자만 문서 열람 가능
- **투명성**: 모든 결재 과정의 추적성 확보
- **사용성**: 일반적인 전자결재의 친숙한 UI/UX 제공
- **확장성**: 전 세계 여러 분원(지사) 구조 지원

### 1.3 시스템 범위
- **포함**: 문서 기안, 결재선 지정, 검토/전결/합의, 반려/재상신, 결재 이력/감사로그, 문서·첨부 보관, 알림, 통계/대시보드, 사용자/조직/권한 관리, 모바일/웹 접근
- **제외**: 외부 기관 전자서명 연계, 전자계약, 복잡한 ERP 통합 (향후 확장)

## 2. 아키텍처 설계

### 2.1 전체 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│                        클라이언트 계층                           │
├─────────────────────────────────────────────────────────────────┤
│  웹 브라우저 (Chrome/Edge/Firefox)  │  모바일 브라우저 (iOS/Android) │
│  - HTML5/CSS3/JavaScript (jQuery)   │  - 반응형 웹 디자인            │
│  - Bootstrap 5.x (선택적)           │  - 터치 최적화 UI              │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTPS/TLS 1.3
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                      프레젠테이션 계층                          │
├─────────────────────────────────────────────────────────────────┤
│                    Spring Boot Web Layer                       │
│  - REST API Controller                                          │
│  - Static Resource Serving (HTML/CSS/JS)                       │
│  - Content Security Policy (CSP)                               │
│  - CORS Configuration                                           │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                      비즈니스 계층                              │
├─────────────────────────────────────────────────────────────────┤
│                    Spring Boot Service Layer                   │
│  - Document Service (문서 관리)                                 │
│  - Approval Service (결재 관리)                                │
│  - User Service (사용자 관리)                                   │
│  - Security Service (보안 관리)                                │
│  - Notification Service (알림 관리)                             │
│  - Audit Service (감사 로그)                                    │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                      데이터 접근 계층                           │
├─────────────────────────────────────────────────────────────────┤
│                    Spring Data JPA Layer                       │
│  - Repository Pattern                                           │
│  - Entity Mapping                                               │
│  - Query Optimization                                           │
│  - Transaction Management                                       │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                      데이터 계층                                │
├─────────────────────────────────────────────────────────────────┤
│                    PostgreSQL 16.x                             │
│  - Document Metadata Storage                                    │
│  - User & Role Management                                       │
│  - Approval Process Data                                        │
│  - Audit Log Storage                                            │
│  - Row Level Security (RLS)                                     │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                      파일 저장소                                │
├─────────────────────────────────────────────────────────────────┤
│                    로컬 파일시스템                              │
│  - Encrypted Document Storage                                   │
│  - Attachment Files                                              │
│  - Backup & Archive                                             │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 보안 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│                      인증/인가 계층                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   MFA 인증      │  │   JWT 토큰      │  │   세션 관리     │  │
│  │   - OTP/푸시    │  │   - Access Token│  │   - HttpOnly    │  │
│  │   - 디바이스 바인딩│  │   - Refresh Token│  │   - SameSite   │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                      권한 관리 계층                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   RBAC          │  │   ABAC          │  │   정책 엔진     │  │
│  │   - 역할 기반   │  │   - 속성 기반   │  │   - 동적 권한   │  │
│  │   - 사용자-역할 │  │   - 문서 속성   │  │   - 결재선 기반 │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                      데이터 보호 계층                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   암호화        │  │   접근 제어     │  │   감사 로그     │  │
│  │   - AES-256     │  │   - RLS         │  │   - WORM 저장   │  │
│  │   - TLS 1.3     │  │   - ACL         │  │   - 불변성 보장 │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 3. 데이터 모델 설계

### 3.1 핵심 엔티티 관계

```
User (사용자)
├── UserRole (사용자-역할)
│   └── Role (역할)
├── Document (문서) [작성자]
│   ├── ApprovalLine (결재선)
│   │   └── ApprovalStep (결재단계) [결재자]
│   ├── Comment (댓글) [작성자]
│   └── Attachment (첨부파일) [업로더]
├── AuditLog (감사로그) [사용자]
└── Policy (정책) [생성자]

Branch (지사)
├── User (소속 사용자)
└── Document (소속 문서)
```

### 3.2 권한 모델

#### 3.2.1 역할 정의
- **GENERAL_MEMBER**: 일반 수도자
- **MIDDLE_MANAGER**: 중간관리 수도자  
- **RESPONSIBLE_MANAGER**: 책임 수도자
- **SUPERIOR**: 장상
- **ADMIN**: 시스템 관리자

#### 3.2.2 권한 매트릭스
| 기능 | 일반수도자 | 중간관리수도자 | 책임수도자 | 장상 | 관리자 |
|------|------------|----------------|------------|------|--------|
| 기안 | ✅ | ✅ | ✅ | ✅ | ❌ |
| 결재/합의 | 결재선 지정 시 | 부서 범위 | 기관 범위 | 전 범위 | ❌ |
| 반려/재상신 | ✅ | ✅ | ✅ | ✅ | ❌ |
| 열람 | 본인/참여 문서 | 부서 결재 문서 | 기관 결재 문서 | 정책에 따름 | 원칙적 제한 |
| 결재선 정책관리 | ❌ | 일부 | ✅ | ✅(최종) | ❌ |
| 접근정책/규정 | ❌ | ❌ | 제안 | ✅(승인) | 설정 지원 |
| 계정/조직 관리 | ❌ | ❌ | ❌ | ❌ | ✅ |

### 3.3 문서 상태 모델

```
DRAFT (초안)
    ↓ [상신]
PENDING (진행중)
    ↓ [승인] / [반려]
APPROVED (승인) / REJECTED (반려)
    ↓ [재상신] (반려 시)
DRAFT (수정 후 재상신)
```

### 3.4 결재선 모델

#### 3.4.1 결재선 유형
- **SEQUENTIAL**: 순차 결재
- **PARALLEL**: 병렬 결재  
- **CONDITIONAL**: 조건부 결재

#### 3.4.2 결재 단계 유형
- **REVIEW**: 검토
- **APPROVE**: 승인
- **CONSULT**: 합의

## 4. 보안 설계

### 4.1 인증 설계

#### 4.1.1 MFA (Multi-Factor Authentication)
```java
public class MFAConfig {
    // OTP 기반 2단계 인증
    @Bean
    public TotpService totpService() {
        return new TotpService();
    }
    
    // 디바이스 바인딩
    @Bean
    public DeviceBindingService deviceBindingService() {
        return new DeviceBindingService();
    }
}
```

#### 4.1.2 JWT 토큰 관리
```java
public class JwtTokenProvider {
    private static final long ACCESS_TOKEN_VALIDITY = 3600; // 1시간
    private static final long REFRESH_TOKEN_VALIDITY = 604800; // 7일
    
    public String generateAccessToken(UserDetails userDetails) {
        // JWT 토큰 생성 로직
    }
    
    public String generateRefreshToken(UserDetails userDetails) {
        // Refresh 토큰 생성 로직
    }
}
```

### 4.2 권한 설계

#### 4.2.1 RBAC + ABAC 하이브리드 모델
```java
@Component
public class PermissionEvaluator {
    
    public boolean hasPermission(Authentication auth, Object targetDomainObject, Object permission) {
        // RBAC: 역할 기반 권한 확인
        if (hasRoleBasedPermission(auth, permission)) {
            return true;
        }
        
        // ABAC: 속성 기반 권한 확인
        return hasAttributeBasedPermission(auth, targetDomainObject, permission);
    }
    
    private boolean hasRoleBasedPermission(Authentication auth, Object permission) {
        // 역할 기반 권한 확인 로직
    }
    
    private boolean hasAttributeBasedPermission(Authentication auth, Object target, Object permission) {
        // 문서 속성, 결재선, 소속 기반 권한 확인 로직
    }
}
```

#### 4.2.2 문서 접근 제어
```java
@Service
public class DocumentAccessControlService {
    
    public boolean canAccessDocument(User user, Document document) {
        // 1. 문서 소유자 확인
        if (document.getAuthor().getId().equals(user.getId())) {
            return true;
        }
        
        // 2. 결재선 참여자 확인
        if (isApprovalParticipant(user, document)) {
            return true;
        }
        
        // 3. 명시적 공유 사용자 확인
        if (isExplicitlyShared(user, document)) {
            return true;
        }
        
        // 4. 대결/위임자 확인
        if (isDelegatedUser(user, document)) {
            return true;
        }
        
        return false;
    }
}
```

### 4.3 데이터 보호 설계

#### 4.3.1 암호화 전략
```java
@Component
public class EncryptionService {
    
    @Value("${app.encryption.key}")
    private String encryptionKey;
    
    public String encrypt(String plainText) {
        // AES-256 암호화
        return AESUtil.encrypt(plainText, encryptionKey);
    }
    
    public String decrypt(String encryptedText) {
        // AES-256 복호화
        return AESUtil.decrypt(encryptedText, encryptionKey);
    }
}
```

#### 4.3.2 Row Level Security (RLS)
```sql
-- 문서 테이블에 RLS 적용
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- 사용자별 문서 접근 정책
CREATE POLICY document_access_policy ON documents
    FOR ALL TO authenticated_users
    USING (
        author_id = current_user_id() OR
        id IN (
            SELECT al.document_id 
            FROM approval_lines al 
            JOIN approval_steps ast ON al.id = ast.approval_line_id 
            WHERE ast.approver_id = current_user_id()
        )
    );
```

## 5. 비즈니스 로직 설계

### 5.1 문서 결재 프로세스

#### 5.1.1 결재 프로세스 상태 머신
```java
public enum DocumentStatus {
    DRAFT("초안"),
    PENDING("진행중"),
    APPROVED("승인"),
    REJECTED("반려"),
    CANCELLED("취소");
    
    private final String description;
}

public enum ApprovalStepStatus {
    PENDING("대기"),
    IN_PROGRESS("진행중"),
    APPROVED("승인"),
    REJECTED("반려"),
    DELEGATED("위임");
    
    private final String description;
}
```

#### 5.1.2 결재 프로세스 서비스
```java
@Service
@Transactional
public class ApprovalProcessService {
    
    public void submitDocument(Document document, List<ApprovalStep> approvalSteps) {
        // 1. 문서 상태를 PENDING으로 변경
        document.setStatus(DocumentStatus.PENDING);
        document.setSubmittedAt(LocalDateTime.now());
        
        // 2. 결재선 생성
        ApprovalLine approvalLine = createApprovalLine(document, approvalSteps);
        
        // 3. 첫 번째 결재 단계 활성화
        activateNextApprovalStep(approvalLine);
        
        // 4. 알림 발송
        notificationService.sendApprovalNotification(approvalLine);
        
        // 5. 감사 로그 기록
        auditService.logDocumentSubmission(document, approvalLine);
    }
    
    public void processApproval(Long stepId, ApprovalAction action, String comments) {
        ApprovalStep step = approvalStepRepository.findById(stepId)
            .orElseThrow(() -> new ApprovalStepNotFoundException(stepId));
        
        // 1. 결재 처리
        step.setStatus(action.getStatus());
        step.setComments(comments);
        step.setCompletedAt(LocalDateTime.now());
        
        // 2. 다음 단계 활성화 또는 문서 완료 처리
        if (action == ApprovalAction.APPROVE) {
            processNextStep(step);
        } else if (action == ApprovalAction.REJECT) {
            rejectDocument(step.getApprovalLine().getDocument());
        }
        
        // 3. 알림 발송
        notificationService.sendApprovalResultNotification(step);
        
        // 4. 감사 로그 기록
        auditService.logApprovalAction(step, action, comments);
    }
}
```

### 5.2 지사별 멀티테넌시 설계

#### 5.2.1 지사 스코핑
```java
@Entity
@Table(name = "documents")
@FilterDef(name = "branchFilter", parameters = @ParamDef(name = "branchId", type = "long"))
@Filter(name = "branchFilter", condition = "branch_id = :branchId")
public class Document {
    @ManyToOne
    @JoinColumn(name = "branch_id")
    private Branch branch;
    
    // ... 기타 필드
}

@Repository
public class DocumentRepository extends JpaRepository<Document, Long> {
    
    @Query("SELECT d FROM Document d WHERE d.branch.id = :branchId")
    List<Document> findByBranchId(@Param("branchId") Long branchId);
}
```

#### 5.2.2 교차 지사 결재 처리
```java
@Service
public class CrossBranchApprovalService {
    
    public void processCrossBranchApproval(Document document, ApprovalStep step) {
        // 1. 교차 지사 접근 권한 확인
        if (!isCrossBranchAccessAllowed(step.getApprover(), document)) {
            throw new CrossBranchAccessDeniedException();
        }
        
        // 2. 최소 권한으로 문서 접근 허용
        grantTemporaryAccess(step.getApprover(), document);
        
        // 3. 결재 완료 후 접근 권한 회수
        scheduleAccessRevocation(step.getApprover(), document, step.getDueDate());
    }
}
```

### 5.3 알림 시스템 설계

#### 5.3.1 알림 채널 인터페이스
```java
public interface NotificationChannel {
    void send(Notification notification);
}

@Component
public class EmailNotificationChannel implements NotificationChannel {
    @Override
    public void send(Notification notification) {
        // 이메일 발송 로직
    }
}

@Component
public class PushNotificationChannel implements NotificationChannel {
    @Override
    public void send(Notification notification) {
        // 푸시 알림 발송 로직
    }
}
```

#### 5.3.2 알림 서비스
```java
@Service
public class NotificationService {
    
    private final List<NotificationChannel> channels;
    
    public void sendApprovalNotification(ApprovalLine approvalLine) {
        Notification notification = Notification.builder()
            .type(NotificationType.APPROVAL_REQUEST)
            .recipient(approvalLine.getCurrentApprover())
            .title("결재 요청")
            .message("새로운 결재 요청이 있습니다.")
            .build();
        
        channels.forEach(channel -> channel.send(notification));
    }
}
```

## 6. 성능 설계

### 6.1 데이터베이스 최적화

#### 6.1.1 인덱스 전략
```sql
-- 복합 인덱스 설계
CREATE INDEX idx_documents_status_author ON documents(status, author_id);
CREATE INDEX idx_documents_branch_created ON documents(branch_id, created_at);
CREATE INDEX idx_approval_steps_approver_status ON approval_steps(approver_id, status);

-- 부분 인덱스 (활성 문서만)
CREATE INDEX idx_documents_active ON documents(branch_id, created_at) 
WHERE status IN ('PENDING', 'APPROVED');
```

#### 6.1.2 쿼리 최적화
```java
@Repository
public class DocumentRepository extends JpaRepository<Document, Long> {
    
    @Query("SELECT d FROM Document d " +
           "JOIN FETCH d.author " +
           "JOIN FETCH d.branch " +
           "WHERE d.branch.id = :branchId " +
           "AND d.status = :status " +
           "ORDER BY d.createdAt DESC")
    Page<Document> findActiveDocumentsByBranch(
        @Param("branchId") Long branchId,
        @Param("status") DocumentStatus status,
        Pageable pageable
    );
}
```

### 6.2 캐싱 전략

#### 6.2.1 Redis 캐싱
```java
@Service
public class CachedUserService {
    
    @Cacheable(value = "users", key = "#userId")
    public User findById(Long userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException(userId));
    }
    
    @CacheEvict(value = "users", key = "#user.id")
    public User updateUser(User user) {
        return userRepository.save(user);
    }
}
```

### 6.3 비동기 처리

#### 6.3.1 이벤트 기반 아키텍처
```java
@Component
public class DocumentEventHandler {
    
    @EventListener
    @Async
    public void handleDocumentSubmitted(DocumentSubmittedEvent event) {
        // 1. 알림 발송
        notificationService.sendDocumentSubmittedNotification(event.getDocument());
        
        // 2. 감사 로그 기록
        auditService.logDocumentEvent(event);
        
        // 3. 통계 업데이트
        statisticsService.updateDocumentStatistics(event.getDocument());
    }
}
```

## 7. 모니터링 및 로깅 설계

### 7.1 감사 로그 설계

#### 7.1.1 감사 이벤트 정의
```java
public enum AuditEventType {
    USER_LOGIN("사용자 로그인"),
    USER_LOGOUT("사용자 로그아웃"),
    DOCUMENT_CREATED("문서 생성"),
    DOCUMENT_VIEWED("문서 열람"),
    DOCUMENT_APPROVED("문서 승인"),
    DOCUMENT_REJECTED("문서 반려"),
    DOCUMENT_DOWNLOADED("문서 다운로드"),
    PERMISSION_CHANGED("권한 변경");
    
    private final String description;
}
```

#### 7.1.2 감사 로그 서비스
```java
@Service
public class AuditService {
    
    @Async
    public void logUserAction(User user, AuditEventType eventType, Object resource, Map<String, Object> details) {
        AuditLog auditLog = AuditLog.builder()
            .userId(user.getId())
            .action(eventType.name())
            .resourceType(resource.getClass().getSimpleName())
            .resourceId(getResourceId(resource))
            .details(details)
            .ipAddress(getCurrentUserIpAddress())
            .userAgent(getCurrentUserAgent())
            .createdAt(LocalDateTime.now())
            .build();
        
        auditLogRepository.save(auditLog);
    }
}
```

### 7.2 시스템 모니터링

#### 7.2.1 헬스 체크
```java
@Component
public class SystemHealthIndicator implements HealthIndicator {
    
    @Override
    public Health health() {
        try {
            // 데이터베이스 연결 확인
            databaseHealthCheck();
            
            // 파일 시스템 확인
            fileSystemHealthCheck();
            
            return Health.up()
                .withDetail("database", "UP")
                .withDetail("filesystem", "UP")
                .build();
        } catch (Exception e) {
            return Health.down()
                .withDetail("error", e.getMessage())
                .build();
        }
    }
}
```

## 8. 배포 및 운영 설계

### 8.1 로컬 개발 환경

#### 8.1.1 Docker Compose 설정
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
      - ./db/init:/docker-entrypoint-initdb.d

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
      - ./uploads:/app/uploads

volumes:
  postgres_data:
```

### 8.2 보안 운영

#### 8.2.1 시크릿 관리
```yaml
# application-dev.yml
spring:
  datasource:
    url: ${DB_URL:jdbc:postgresql://localhost:5432/approval_system_dev}
    username: ${DB_USERNAME:approval_user}
    password: ${DB_PASSWORD:approval_password}
  
  security:
    jwt:
      secret: ${JWT_SECRET:dev-secret-key-change-in-production}
      expiration: ${JWT_EXPIRATION:3600}
  
  encryption:
    key: ${ENCRYPTION_KEY:dev-encryption-key-change-in-production}
```

## 9. 확장성 설계

### 9.1 마이크로서비스 전환 준비

#### 9.1.1 도메인 분리
```java
// 사용자 관리 도메인
@RestController
@RequestMapping("/api/v1/users")
public class UserController {
    // 사용자 관련 API
}

// 문서 관리 도메인  
@RestController
@RequestMapping("/api/v1/documents")
public class DocumentController {
    // 문서 관련 API
}

// 결재 관리 도메인
@RestController
@RequestMapping("/api/v1/approvals")
public class ApprovalController {
    // 결재 관련 API
}
```

### 9.2 API 버전 관리

#### 9.2.1 버전별 API 설계
```java
@RestController
@RequestMapping("/api/v1")
public class DocumentControllerV1 {
    // V1 API 구현
}

@RestController
@RequestMapping("/api/v2")
public class DocumentControllerV2 {
    // V2 API 구현 (하위 호환성 유지)
}
```

## 10. 테스트 설계

### 10.1 테스트 전략

#### 10.1.1 테스트 피라미드
```
        E2E Tests (5%)
       ┌─────────────────┐
      │  Integration Tests (25%)  │
     ┌─────────────────────────────┐
    │      Unit Tests (70%)        │
   └─────────────────────────────────┘
```

#### 10.1.2 단위 테스트 예시
```java
@ExtendWith(MockitoExtension.class)
class ApprovalProcessServiceTest {
    
    @Mock
    private DocumentRepository documentRepository;
    
    @Mock
    private ApprovalLineRepository approvalLineRepository;
    
    @InjectMocks
    private ApprovalProcessService approvalProcessService;
    
    @Test
    void shouldSubmitDocumentSuccessfully() {
        // Given
        Document document = createTestDocument();
        List<ApprovalStep> steps = createTestApprovalSteps();
        
        // When
        approvalProcessService.submitDocument(document, steps);
        
        // Then
        verify(documentRepository).save(document);
        verify(approvalLineRepository).save(any(ApprovalLine.class));
        assertThat(document.getStatus()).isEqualTo(DocumentStatus.PENDING);
    }
}
```

이 설계문서는 requirement.md의 모든 요구사항을 반영하여 로컬 개발 환경에 최적화된 시스템 설계를 제시합니다. 보안을 최우선으로 하면서도 확장 가능한 아키텍처를 구성했습니다.
