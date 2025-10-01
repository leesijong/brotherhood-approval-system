# 데이터베이스 설계 및 ERD

## 데이터베이스 개요

### 기본 정보
- **데이터베이스**: PostgreSQL 17
- **인코딩**: UTF-8
- **타임존**: UTC (Asia/Seoul은 애플리케이션 레벨에서 처리)
- **ID 타입**: UUID (Universally Unique Identifier)
- **최종 업데이트**: 2025-10-01

### 설계 원칙
1. **정규화**: 3NF 이상 준수
2. **보안**: Row Level Security (RLS) 활성화
3. **성능**: 적절한 인덱스 설계
4. **확장성**: 지사별 멀티테넌시 지원
5. **감사**: 모든 변경사항 추적
6. **UUID 사용**: 모든 테이블에서 UUID를 기본키로 사용

## 테이블 목록

| 순서 | 테이블명 | 설명 | 주요 컬럼 수 |
|------|---------|------|--------------|
| 1 | branches | 지사/분원 | 10 |
| 2 | roles | 역할 | 7 |
| 3 | users | 사용자 | 11 |
| 4 | user_roles | 사용자-역할 매핑 | 8 |
| 5 | documents | 문서 | 19 |
| 6 | approval_lines | 결재선 | 10 |
| 7 | approval_steps | 결재 단계 | 16 |
| 8 | approval_histories | 결재 이력 | 10 |
| 9 | comments | 댓글 | 9 |
| 10 | attachments | 첨부파일 | 14 |
| 11 | audit_logs | 감사 로그 | 13 |
| 12 | policies | 정책 | 9 |

## 테이블 상세 설계

### 1. BRANCHES (지사/분원)

```sql
CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,                    -- 지사명
    code VARCHAR(20) NOT NULL UNIQUE,              -- 지사 코드 (HQ, BUSAN, DAEGU 등)
    address TEXT,                                  -- 주소
    phone VARCHAR(20),                             -- 전화번호
    email VARCHAR(100),                            -- 이메일
    parent_id UUID REFERENCES branches(id),        -- 상위 지사 (계층 구조)
    is_active BOOLEAN DEFAULT true,                -- 활성화 여부
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**특징:**
- 계층 구조 지원 (parent_id를 통한 self-reference)
- 전 세계 분원 구조 지원
- 지사별 접근 제어의 기준

### 2. ROLES (역할)

```sql
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,              -- 역할명 (ADMIN, USER 등)
    description TEXT,                              -- 역할 설명
    is_system_role BOOLEAN DEFAULT false,          -- 시스템 기본 역할 여부
    is_active BOOLEAN DEFAULT true,                -- 활성화 여부
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**기본 역할:**
- `SUPER_ADMIN`: 최고 관리자
- `ADMIN`: 관리자
- `MANAGER`: 중간관리수도자
- `SUPERIOR`: 책임수도자
- `USER`: 일반수도자

### 3. USERS (사용자)

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,                    -- 사용자 이름
    login_id VARCHAR(50) NOT NULL UNIQUE,          -- 로그인 ID
    email VARCHAR(100) NOT NULL UNIQUE,            -- 이메일
    password_hash VARCHAR(255) NOT NULL,           -- 비밀번호 해시 (BCrypt)
    baptismal_name VARCHAR(50) NOT NULL,           -- 세례명 (필수)
    phone VARCHAR(20),                             -- 전화번호
    branch_id UUID NOT NULL REFERENCES branches(id), -- 소속 지사
    is_active BOOLEAN DEFAULT true,                -- 활성화 여부
    last_login_at TIMESTAMP WITH TIME ZONE,        -- 마지막 로그인 시각
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**표시 방식:**
- 시스템 내 표시: `name (baptismal_name)` 형태
- 예: "김철수 (요한)"

### 4. USER_ROLES (사용자-역할 매핑)

```sql
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id), -- 지사별 역할
    granted_by UUID REFERENCES users(id),            -- 권한 부여자
    is_active BOOLEAN DEFAULT true,                  -- 활성화 여부
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,             -- 만료일 (위임 시 사용)
    UNIQUE(user_id, role_id, branch_id)
);
```

**특징:**
- 사용자는 지사별로 다른 역할을 가질 수 있음
- 임시 권한 부여 지원 (expires_at)

### 5. DOCUMENTS (문서)

```sql
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,                   -- 문서 제목
    content TEXT,                                  -- 문서 내용
    document_type VARCHAR(50) NOT NULL,            -- 문서 유형
    security_level VARCHAR(20) NOT NULL DEFAULT 'GENERAL', -- 보안 등급
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',   -- 문서 상태
    priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL', -- 우선순위
    document_number VARCHAR(50) UNIQUE,            -- 문서 번호
    author_id UUID NOT NULL REFERENCES users(id),  -- 작성자
    branch_id UUID NOT NULL REFERENCES branches(id), -- 소속 지사
    parent_document_id UUID REFERENCES documents(id), -- 부모 문서 (버전 관리)
    version INTEGER DEFAULT 1,                     -- 버전
    is_final BOOLEAN DEFAULT false,                -- 최종 버전 여부
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP WITH TIME ZONE,         -- 상신 시각
    approved_at TIMESTAMP WITH TIME ZONE,          -- 승인 시각
    rejected_at TIMESTAMP WITH TIME ZONE,          -- 반려 시각
    rejection_reason TEXT,                         -- 반려 사유
    due_date TIMESTAMP WITHOUT TIME ZONE           -- 마감일
);
```

**문서 상태:**
- `DRAFT`: 초안
- `PENDING`: 결재 대기
- `APPROVED`: 승인됨
- `REJECTED`: 반려됨
- `CANCELLED`: 취소됨

**보안 등급:**
- `GENERAL`: 일반
- `CONFIDENTIAL`: 대외비
- `SECRET`: 비밀
- `TOP_SECRET`: 극비

### 6. APPROVAL_LINES (결재선)

```sql
CREATE TABLE approval_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,                    -- 결재선 이름
    description TEXT,                              -- 설명
    is_parallel BOOLEAN DEFAULT false,             -- 병렬 결재 여부
    is_conditional BOOLEAN DEFAULT false,          -- 조건부 결재 여부
    condition_expression TEXT,                     -- 조건식
    created_by UUID NOT NULL REFERENCES users(id), -- 생성자
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**결재선 유형:**
- 순차 결재: `is_parallel = false`
- 병렬 결재: `is_parallel = true`
- 조건부 결재: `is_conditional = true`

### 7. APPROVAL_STEPS (결재 단계)

```sql
CREATE TABLE approval_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    approval_line_id UUID NOT NULL REFERENCES approval_lines(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,                   -- 단계 순서
    approver_id UUID NOT NULL REFERENCES users(id), -- 결재자
    approver_type VARCHAR(20) NOT NULL DEFAULT 'PERSON', -- 결재자 유형
    is_required BOOLEAN DEFAULT true,              -- 필수 결재 여부
    is_delegatable BOOLEAN DEFAULT true,           -- 위임 가능 여부
    max_delegation_level INTEGER DEFAULT 1,        -- 최대 위임 단계
    alternate_approver_id UUID REFERENCES users(id), -- 대결자
    status VARCHAR(20) DEFAULT 'PENDING',          -- 단계 상태
    is_conditional BOOLEAN DEFAULT false,          -- 조건부 단계 여부
    condition_expression TEXT,                     -- 조건식
    comments TEXT,                                 -- 결재 의견
    approved_at TIMESTAMP WITH TIME ZONE,          -- 승인 시각
    rejected_at TIMESTAMP WITH TIME ZONE,          -- 반려 시각
    delegated_at TIMESTAMP WITH TIME ZONE,         -- 위임 시각
    due_date DATE,                                 -- 결재 마감일
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**결재자 유형:**
- `PERSON`: 개인
- `ROLE`: 역할
- `BRANCH`: 지사

**단계 상태:**
- `PENDING`: 대기중
- `APPROVED`: 승인됨
- `REJECTED`: 반려됨
- `DELEGATED`: 위임됨
- `RETURNED`: 반송됨
- `CANCELLED`: 취소됨

### 8. APPROVAL_HISTORIES (결재 이력)

```sql
CREATE TABLE approval_histories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    approval_step_id UUID NOT NULL REFERENCES approval_steps(id),
    approver_id UUID NOT NULL REFERENCES users(id), -- 결재자
    action VARCHAR(20) NOT NULL,                   -- 결재 액션
    comment TEXT,                                  -- 결재 의견
    delegated_to UUID REFERENCES users(id),        -- 위임 대상
    action_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,                               -- IP 주소
    user_agent TEXT                                -- User Agent
);
```

**결재 액션:**
- `APPROVE`: 승인
- `REJECT`: 반려
- `DELEGATE`: 위임
- `RETURN`: 반송
- `CANCEL`: 취소

### 9. COMMENTS (댓글)

```sql
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,                         -- 댓글 내용
    parent_comment_id UUID REFERENCES comments(id), -- 부모 댓글 (스레드)
    is_internal BOOLEAN DEFAULT false,             -- 내부 댓글 여부
    is_edited BOOLEAN DEFAULT false,               -- 수정 여부
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**특징:**
- 스레드 댓글 지원 (parent_comment_id)
- 내부 댓글과 외부 댓글 구분

### 10. ATTACHMENTS (첨부파일)

```sql
CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,                -- 파일명
    original_filename VARCHAR(255) NOT NULL,       -- 원본 파일명
    stored_filename VARCHAR(255) NOT NULL,         -- 저장된 파일명
    file_path VARCHAR(500) NOT NULL,               -- 파일 경로
    file_size BIGINT NOT NULL,                     -- 파일 크기 (bytes)
    mime_type VARCHAR(100) NOT NULL,               -- MIME 타입
    checksum VARCHAR(64) NOT NULL,                 -- 체크섬 (SHA-256)
    uploaded_by UUID NOT NULL REFERENCES users(id), -- 업로드한 사용자
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_encrypted BOOLEAN DEFAULT false,            -- 암호화 여부
    encryption_key_id VARCHAR(100),                -- 암호화 키 ID
    description TEXT,                              -- 파일 설명
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**파일 저장:**
- 로컬 개발: `./uploads/` 디렉토리
- 프로덕션: 암호화된 스토리지

### 11. AUDIT_LOGS (감사 로그)

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL,                   -- 액션 유형
    resource_type VARCHAR(50) NOT NULL,            -- 리소스 타입
    resource_id VARCHAR(255) NOT NULL,             -- 리소스 ID
    old_values JSONB,                              -- 변경 전 값
    new_values JSONB,                              -- 변경 후 값
    ip_address INET,                               -- IP 주소
    user_agent TEXT,                               -- User Agent
    session_id VARCHAR(255),                       -- 세션 ID
    is_successful BOOLEAN,                         -- 성공 여부
    error_message TEXT,                            -- 오류 메시지
    action_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**감사 대상 액션:**
- 로그인/로그아웃
- 문서 생성/수정/삭제/조회
- 결재 승인/반려
- 권한 변경
- 파일 업로드/다운로드

### 12. POLICIES (정책)

```sql
CREATE TABLE policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,                    -- 정책 이름
    description TEXT,                              -- 정책 설명
    policy_type VARCHAR(50) NOT NULL,              -- 정책 유형
    policy_data JSONB NOT NULL,                    -- 정책 데이터 (JSON)
    is_active BOOLEAN DEFAULT true,                -- 활성화 여부
    created_by UUID NOT NULL REFERENCES users(id), -- 생성자
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**정책 유형:**
- `APPROVAL_LINE`: 결재선 정책
- `ACCESS_CONTROL`: 접근 제어 정책
- `RETENTION`: 보존 기간 정책
- `NOTIFICATION`: 알림 정책

## ERD (Entity Relationship Diagram)

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     BRANCHES    │    │      ROLES      │    │      USERS      │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (PK, UUID)   │    │ id (PK, UUID)   │    │ id (PK, UUID)   │
│ name            │    │ name (UQ)       │    │ name            │
│ code (UQ)       │    │ description     │    │ login_id (UQ)   │
│ address         │    │ is_system_role  │    │ email (UQ)      │
│ phone           │    │ is_active       │    │ password_hash   │
│ email           │    │ created_at      │    │ baptismal_name  │
│ parent_id (FK)  │←──┐│ updated_at      │    │ phone           │
│ is_active       │   │└─────────────────┘    │ branch_id (FK)  │──┐
│ created_at      │   │         ↓              │ is_active       │  │
│ updated_at      │   │   ┌─────────────┐     │ last_login_at   │  │
└─────────────────┘   │   │ USER_ROLES  │     │ created_at      │  │
                      │   ├─────────────┤     │ updated_at      │  │
                      │   │ id (PK)     │     └─────────────────┘  │
                      │   │ user_id (FK)│──────────────┘            │
                      │   │ role_id (FK)│                           │
                      └───│ branch_id   │                           │
                          │ granted_by  │                           │
                          │ is_active   │                           │
                          │ granted_at  │                           │
                          │ expires_at  │                           │
                          └─────────────┘                           │
                                                                    │
         ┌──────────────────────────────────────────────────────────┘
         │
         │  ┌─────────────────┐
         │  │    DOCUMENTS    │
         │  ├─────────────────┤
         └─→│ id (PK, UUID)   │
            │ title           │
            │ content         │
            │ document_type   │
            │ security_level  │
            │ status          │
            │ priority        │
            │ document_number │
            │ author_id (FK)  │──────────┐
            │ branch_id (FK)  │          │
            │ parent_doc_id   │──┐       │
            │ version         │  │       │
            │ is_final        │  │       │
            │ created_at      │  │       │
            │ updated_at      │  │       │
            │ submitted_at    │  │       │
            │ approved_at     │  │       │
            │ rejected_at     │  │       │
            │ rejection_reason│  │       │
            │ due_date        │  │       │
            └─────────────────┘  │       │
                   │             │       │
                   └─────────────┘       │
                                         │
            ┌─────────────────┐          │
            │  APPROVAL_LINES │          │
            ├─────────────────┤          │
            │ id (PK, UUID)   │          │
            │ document_id (FK)│──────────┘
            │ name            │
            │ description     │
            │ is_parallel     │
            │ is_conditional  │
            │ condition_expr  │
            │ created_by (FK) │
            │ created_at      │
            │ updated_at      │
            └─────────────────┘
                   │
                   │
            ┌─────────────────┐
            │ APPROVAL_STEPS  │
            ├─────────────────┤
            │ id (PK, UUID)   │
            │ approval_line_id│──────────┘
            │ step_order      │
            │ approver_id (FK)│
            │ approver_type   │
            │ is_required     │
            │ is_delegatable  │
            │ max_deleg_level │
            │ alternate_id(FK)│
            │ status          │
            │ is_conditional  │
            │ condition_expr  │
            │ comments        │
            │ approved_at     │
            │ rejected_at     │
            │ delegated_at    │
            │ due_date        │
            │ created_at      │
            └─────────────────┘
                   │
                   │
            ┌─────────────────┐
            │ APPROVAL_HISTORY│
            ├─────────────────┤
            │ id (PK, UUID)   │
            │ document_id (FK)│
            │ approval_step_id│──────────┘
            │ approver_id (FK)│
            │ action          │
            │ comment         │
            │ delegated_to(FK)│
            │ action_at       │
            │ ip_address      │
            │ user_agent      │
            └─────────────────┘
```

## 인덱스 설계

### 성능 최적화 인덱스

```sql
-- 사용자 관련
CREATE INDEX idx_users_branch_id ON users(branch_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_login_id ON users(login_id);
CREATE INDEX idx_users_name ON users(name);

-- 문서 관련
CREATE INDEX idx_documents_author_id ON documents(author_id);
CREATE INDEX idx_documents_branch_id ON documents(branch_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_created_at ON documents(created_at);

-- 결재 관련
CREATE INDEX idx_approval_lines_document_id ON approval_lines(document_id);
CREATE INDEX idx_approval_steps_approval_line_id ON approval_steps(approval_line_id);
CREATE INDEX idx_approval_steps_approver_id ON approval_steps(approver_id);
CREATE INDEX idx_approval_steps_alternate_approver_id ON approval_steps(alternate_approver_id);
CREATE INDEX idx_approval_steps_status ON approval_steps(status);
CREATE INDEX idx_approval_histories_document_id ON approval_histories(document_id);
CREATE INDEX idx_approval_histories_approver_id ON approval_histories(approver_id);

-- 댓글 관련
CREATE INDEX idx_comments_document_id ON comments(document_id);

-- 첨부파일 관련
CREATE INDEX idx_attachments_document_id ON attachments(document_id);

-- 감사 로그 관련
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_action_at ON audit_logs(action_at);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
```

## 보안 설정

### 1. Row Level Security (RLS)

모든 테이블에 RLS를 활성화하여 사용자별/지사별 데이터 접근 제어:

```sql
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_histories ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
```

### 2. 트리거

`updated_at` 자동 업데이트:

```sql
CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON branches 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
-- 기타 테이블도 동일하게 적용
```

## 데이터베이스 통계

### 현재 로컬 데이터베이스 (2025-10-01 기준)

| 테이블 | 레코드 수 |
|--------|----------|
| branches | 5 |
| roles | 9 |
| users | 12 |
| documents | 15 |
| approval_lines | 9 |
| approval_steps | 18 |

### Railway 프로덕션 데이터베이스

- PostgreSQL 서비스: 활성화
- 연결 상태: 정상
- 테이블: 12개 생성됨
- 데이터: 초기화 대기 중

## 마이그레이션 전략

### 로컬 → Railway 데이터 이전

1. **스키마 먼저 생성** (JPA Hibernate 자동 생성)
2. **초기 데이터 삽입** (SQL 스크립트)
3. **외래키 순서 준수**:
   - branches → roles → users → user_roles
   - documents → approval_lines → approval_steps
   - comments, attachments, audit_logs, policies

### Flyway 마이그레이션 (로컬 개발용)

```
src/main/resources/db/migration/
├── V1__init.sql          # 초기 스키마 생성
├── V2__seed_data.sql     # 초기 데이터 삽입
```

**주의:** Railway 배포 시에는 Flyway를 사용하지 않고 JPA Hibernate의 `ddl-auto: update` 사용

## 데이터베이스 백업 및 복구

### pg_dump를 사용한 백업

```bash
# 스키마만 백업
pg_dump -U postgres -d approval_system_dev --schema-only -f schema.sql

# 데이터만 백업
pg_dump -U postgres -d approval_system_dev --data-only --inserts -f data.sql

# 전체 백업
pg_dump -U postgres -d approval_system_dev -f full_backup.sql
```

### 복구

```bash
psql -U postgres -d approval_system_dev -f full_backup.sql
```

## 성능 튜닝

### 1. 연결 풀 설정 (HikariCP)

```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 10
      minimum-idle: 5
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
```

### 2. JPA 설정

```yaml
spring:
  jpa:
    properties:
      hibernate:
        jdbc:
          batch_size: 20
        order_inserts: true
        order_updates: true
```

### 3. 쿼리 최적화

- N+1 문제 해결: Fetch Join 사용
- Lazy Loading: 필요한 경우에만 EAGER 사용
- 페이지네이션: 모든 목록 조회에 적용

이 설계는 로컬 개발 환경과 Railway 프로덕션 환경 모두에서 사용 가능하며, UUID 기반으로 확장성과 보안을 강화했습니다.
