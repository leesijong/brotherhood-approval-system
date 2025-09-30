# 시스템 설계 문서 (2025-09-22 현행화)

## 1. 시스템 개요

### 1.1 프로젝트 목적
한국순교복자수도회의 내부 문서 결재 시스템을 전자화하여 투명성과 추적성을 확보하고, 보안과 접근통제를 최우선으로 하는 전자결재 시스템을 구축한다.

### 1.2 핵심 목표
- **보안 우선**: 결재 라인 또는 명시된 권한이 있는 사용자만 문서 열람 가능
- **투명성**: 모든 결재 과정의 추적성 확보
- **사용성**: 일반적인 전자결재의 친숙한 UI/UX 제공
- **확장성**: 전 세계 여러 분원(지사) 구조 지원
- **UUID 기반**: 모든 주요 식별자를 UUID로 관리하여 확장성과 보안 강화

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
│  - Next.js 14.2.25 + React 19       │  - 반응형 웹 디자인            │
│  - TypeScript 5.x                    │  - 터치 최적화 UI              │
│  - Tailwind CSS + shadcn/ui          │  - PWA 지원 (향후)              │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTPS/TLS 1.3
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                      프레젠테이션 계층                          │
├─────────────────────────────────────────────────────────────────┤
│                    Spring Boot Web Layer                       │
│  - REST API Controller (context-path: /api)                     │
│  - JWT Token Authentication                                      │
│  - CORS Configuration (프론트엔드 연동) ✅ **2025-09-22 완료**     │
│  - OpenAPI 3.0 (Swagger) Documentation                          │
│  - Health Check Endpoint                                         │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                      비즈니스 계층                              │
├─────────────────────────────────────────────────────────────────┤
│                    Spring Boot Service Layer                   │
│  - AuthService (JWT 기반 인증)                                  │
│  - UserService (UUID 기반 사용자 관리)                          │
│  - DocumentService (UUID 기반 문서 관리)                        │
│  - ApprovalService (UUID 기반 결재 관리)                        │
│  - NotificationService (알림 관리)                              │
│  - AuditLogService (감사 로그)                                  │
│  - AccessControlService (접근 제어)                             │
│  - DashboardService (대시보드 통계)                             │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                      데이터 접근 계층                           │
├─────────────────────────────────────────────────────────────────┤
│                    Spring Data JPA Layer                       │
│  - Repository Pattern (UUID 기반)                               │
│  - Entity Mapping (UUID 기본키)                                 │
│  - MapStruct Object Mapping                                     │
│  - Query Optimization                                           │
│  - Transaction Management                                       │
│  - Flyway Database Migration                                    │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                      데이터 계층                                │
├─────────────────────────────────────────────────────────────────┤
│                    PostgreSQL 17                               │
│  - UUID 기본키 사용                                             │
│  - Document Metadata Storage                                    │
│  - User & Role Management (UUID 기반)                           │
│  - Approval Process Data (UUID 기반)                            │
│  - Audit Log Storage                                            │
│  - Row Level Security (RLS)                                     │
│  - UUID 확장 기능 활성화                                        │
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
│  │   JWT 인증      │  │   토큰 관리     │  │   세션 관리     │  │
│  │   - Access Token│  │   - Refresh Token│  │   - HttpOnly    │  │
│  │   - 1시간 만료  │  │   - 7일 만료    │  │   - SameSite    │  │
│  │   - UUID 기반   │  │   - 자동 갱신   │  │   - Secure      │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                      권한 관리 계층                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   역할 기반     │  │   리소스 기반   │  │   지사별 분리   │  │
│  │   - SUPER_ADMIN │  │   - 문서 접근   │  │   - Branch UUID │  │
│  │   - MANAGER     │  │   - 결재 권한   │  │   - 데이터 격리 │  │
│  │   - USER        │  │   - 관리 권한   │  │   - 멀티테넌시   │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                      데이터 보호 계층                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   암호화        │  │   감사 로그     │  │   접근 제어     │  │
│  │   - BCrypt 해시 │  │   - 모든 액션   │  │   - RLS 정책    │  │
│  │   - 파일 암호화 │  │   - UUID 추적   │  │   - IP 제한     │  │
│  │   - 전송 암호화 │  │   - 타임스탬프  │  │   - 권한 검증   │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 3. 데이터 모델 설계

### 3.1 핵심 엔티티 관계

```
Users (UUID) ──┐
               ├── UserRoles (UUID) ── Roles (UUID)
Branches (UUID)┘

Documents (UUID) ──┬── ApprovalLines (UUID) ─── ApprovalSteps (UUID)
                   ├── Comments (UUID)
                   ├── Attachments (UUID)
                   └── ApprovalHistory (UUID)

AuditLogs (UUID) ── Users (UUID)
Notifications (UUID) ── Users (UUID)
Policies (UUID) ── Users (UUID)
```

### 3.2 UUID 기반 설계의 장점

- **확장성**: 분산 시스템에서 고유성 보장
- **보안성**: 순차적 ID 추측 불가
- **통합성**: 여러 시스템 간 ID 충돌 방지
- **추적성**: 생성 시점과 소스 추적 가능

## 4. API 설계

### 4.1 REST API 구조

```
/api/
├── /auth
│   ├── POST /login          # 로그인 (JWT 토큰 발급)
│   ├── POST /refresh        # 토큰 갱신
│   ├── POST /logout         # 로그아웃
│   └── GET /validate        # 토큰 검증
├── /users
│   ├── GET /                # 사용자 목록
│   ├── GET /{uuid}          # 사용자 상세
│   ├── POST /               # 사용자 생성
│   ├── PUT /{uuid}          # 사용자 수정
│   └── DELETE /{uuid}       # 사용자 삭제
├── /documents
│   ├── GET /                # 문서 목록
│   ├── GET /{uuid}          # 문서 상세
│   ├── POST /               # 문서 생성
│   ├── PUT /{uuid}          # 문서 수정
│   └── DELETE /{uuid}       # 문서 삭제
├── /approvals
│   ├── GET /lines           # 결재선 목록
│   ├── POST /lines          # 결재선 생성
│   ├── POST /actions        # 결재 액션
│   └── GET /history         # 결재 이력
├── /dashboard
│   ├── GET /stats           # 대시보드 통계
│   ├── GET /recent          # 최근 활동
│   └── GET /pending         # 대기 문서
└── /health                  # 헬스 체크
```

### 4.2 응답 형식 표준화

```json
{
  "success": true,
  "message": "요청 처리 완료",
  "data": {
    // 실제 데이터
  },
  "timestamp": "2025-09-22T15:30:00.000Z"
}
```

## 5. 보안 설계

### 5.1 인증 시스템

- **JWT 기반**: Stateless 인증
- **토큰 구조**: Header.Payload.Signature
- **Payload 내용**: userId(UUID), username, roles, branchId(UUID), exp
- **토큰 만료**: Access Token 1시간, Refresh Token 7일

### 5.2 권한 관리

```java
// 역할 기반 권한
SUPER_ADMIN: 모든 권한
MANAGER: 관리 권한 + 결재 권한
SUPERVISOR: 감독 권한 + 결재 권한
SENIOR: 선임 권한 + 결재 권한
USER: 기본 권한 (문서 생성/조회)

// 리소스 기반 권한
문서 접근: 작성자, 결재자, 관리자만
결재 권한: 지정된 결재선의 결재자만
관리 권한: SUPER_ADMIN, MANAGER만
```

### 5.3 데이터 보호

- **비밀번호**: BCrypt 해싱 (salt rounds: 10)
- **파일 암호화**: AES-256 암호화
- **전송 보안**: HTTPS/TLS 1.3
- **데이터베이스**: Row Level Security (RLS)

## 6. 성능 설계

### 6.1 데이터베이스 최적화

```sql
-- UUID 인덱스 최적화
CREATE INDEX idx_users_id ON users USING hash(id);
CREATE INDEX idx_documents_author_id ON documents(author_id);
CREATE INDEX idx_approval_steps_approver_id ON approval_steps(approver_id);

-- 복합 인덱스
CREATE INDEX idx_documents_branch_status ON documents(branch_id, status);
CREATE INDEX idx_user_roles_user_branch ON user_roles(user_id, branch_id, is_active);
```

### 6.2 애플리케이션 최적화

- **MapStruct**: 컴파일 타임 객체 매핑
- **Lazy Loading**: JPA 지연 로딩
- **Connection Pooling**: HikariCP 사용
- **Query Optimization**: N+1 문제 해결

## 7. 모니터링 및 로깅

### 7.1 감사 로그 (2025-09-23 업데이트)

```java
@AuditLog
public class AuditLog {
    private UUID id;
    private UUID userId;
    private String action;
    private String resourceType;
    private UUID resourceId; // UUID로 변경 (2025-09-23)
    private String ipAddress;
    private String userAgent;
    private String sessionId;
    private Boolean isSuccessful;
    private String errorMessage;
    private LocalDateTime actionAt;
    private LocalDateTime createdAt;
}
```

#### 감사 로그 구현 완료 사항
- ✅ **UUID 기반 ID**: 모든 감사 로그 식별자를 UUID로 관리
- ✅ **상세 추적 정보**: IP 주소, 사용자 에이전트, 세션 ID 포함
- ✅ **성공/실패 상태**: 작업 결과 추적 및 오류 메시지 저장
- ✅ **타임스탬프**: 작업 시간과 생성 시간 분리 관리
- ✅ **서비스 레이어**: AuditLogService를 통한 중앙화된 로그 관리

### 7.2 애플리케이션 로그

- **로그 레벨**: DEBUG (개발), INFO (운영)
- **로그 파일**: 로테이션 설정
- **중요 이벤트**: 로그인, 결재 액션, 권한 변경
- **성능 로그**: SQL 쿼리, API 응답 시간

## 8. 배포 및 운영

### 8.1 개발 환경

```
개발 환경:
- Java 17
- Gradle 8.5
- PostgreSQL 17
- Next.js 14.2.25
- Node.js 18.x
```

### 8.2 빌드 및 배포

```bash
# 백엔드 빌드
cd backend
gradle clean build -x test

# 프론트엔드 빌드
cd brotherhood
npm run build

# 로컬 실행
gradle bootRun  # 백엔드
npm run dev     # 프론트엔드
```

### 8.3 데이터베이스 마이그레이션

```sql
-- Flyway 마이그레이션
V1__init.sql: UUID 기반 스키마 생성
V2__seed_data.sql: 초기 데이터 삽입 (UUID 기반)
```

## 9. 확장성 고려사항

### 9.1 수평 확장

- **로드 밸런싱**: 다중 인스턴스 지원
- **세션 무상태**: JWT 기반 인증
- **데이터베이스**: 읽기 전용 복제본 지원

### 9.2 기능 확장

- **모바일 앱**: React Native 또는 Flutter
- **PWA**: 오프라인 지원
- **외부 연동**: 전자서명, ERP 시스템
- **다국어**: i18n 지원

## 10. 현재 구현 상태 (2025-09-23 업데이트)

### 10.1 완료된 기능

- ✅ **백엔드 전체**: Spring Boot 3.2.0 기반 완전 구현
- ✅ **프론트엔드 전체**: Next.js 14.2.25 기반 완전 구현
- ✅ **데이터베이스**: PostgreSQL 17 + UUID 기반 설계
- ✅ **인증 시스템**: JWT 기반 로그인/로그아웃 완전 구현
- ✅ **사용자 관리**: UUID 기반 사용자 목록/통계 조회 기능
- ✅ **API 연동**: 실제 백엔드-프론트엔드 통신 및 CORS 설정
- ✅ **보안 구현**: BCrypt 해싱, JWT 토큰 관리, 세션 보안
- ✅ **문서화**: 모든 기술 문서 현행화

### 10.2 해결된 기술적 이슈

- ✅ **JPA Lazy Loading 문제**: `Illegal pop() with non-matching JdbcValuesSourceProcessingState` 오류 해결
- ✅ **데이터베이스 스키마 불일치**: 누락된 컬럼들 추가 및 엔티티-테이블 완전 동기화
- ✅ **컴파일 오류**: MapStruct 매핑, UUID 타입 불일치, 중복 메서드 정의 문제 해결
- ✅ **권한 검증**: Spring Security `@PreAuthorize` 설정 및 JWT 토큰 역할 정보 포함
- ✅ **자동 로그인 문제**: 브라우저 캐시 초기화 및 Fresh Login 페이지 구현

### 10.3 테스트 완료

- ✅ **로그인 기능**: admin/admin123 계정으로 정상 로그인 및 JWT 토큰 발급
- ✅ **사용자 목록 API**: `GET /api/users` - 페이지네이션 지원 및 정상 응답
- ✅ **사용자 통계 API**: `GET /api/users/stats` - 관리자 권한 테스트 성공
- ✅ **API 응답**: 모든 엔드포인트 정상 응답 및 에러 처리
- ✅ **데이터베이스**: UUID 기반 데이터 저장/조회 및 관계 매핑
- ✅ **프론트엔드 연동**: 실제 백엔드 API 호출 및 응답 처리
- ✅ **로그인 페이지**: 정식 로그인 페이지 및 Fresh Login 테스트 페이지 구현

### 10.4 구현된 페이지

- ✅ **정식 로그인 페이지**: `http://localhost:3000/login` - 완전한 기능의 로그인 폼
- ✅ **Fresh Login 페이지**: `http://localhost:3000/fresh-login` - 자동 로그인 문제 해결용
- ✅ **사용자 관리 테스트 페이지**: `http://localhost:3000/user-management-test` - API 테스트용
- ✅ **로그인 테스트 페이지**: `http://localhost:3000/login-test` - 간단한 로그인 테스트용

### 10.5 향후 개선사항

- **테스트 코드**: UUID 변환 관련 테스트 코드 수정
- **성능 최적화**: 대용량 데이터 처리 최적화
- **보안 강화**: MFA, 추가 보안 정책 구현
- **사용자 경험**: UI/UX 개선 및 모바일 최적화
- **문서 관리**: 문서 생성, 결재선 설정 등 핵심 비즈니스 로직 구현