# 데이터베이스 설계 및 ERD

## 데이터베이스 개요

### 기본 정보
- **데이터베이스**: PostgreSQL 17
- **인코딩**: UTF-8
- **로케일**: ko_KR.UTF-8
- **타임존**: Asia/Seoul
- **ID 타입**: UUID (Universally Unique Identifier)

### 설계 원칙
1. **정규화**: 3NF 이상 준수
2. **보안**: 민감 데이터 암호화
3. **성능**: 적절한 인덱스 설계
4. **확장성**: 지사별 멀티테넌시 지원
5. **감사**: 모든 변경사항 추적
6. **UUID 사용**: 모든 주요 테이블에서 UUID를 기본키로 사용

## ERD (Entity Relationship Diagram)

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     BRANCHES    │    │      ROLES      │    │      USERS      │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (PK, UUID)   │    │ id (PK, UUID)   │    │ id (PK, UUID)   │
│ name            │    │ name            │    │ username        │
│ code            │    │ description     │    │ email           │
│ address         │    │ permissions     │    │ password_hash   │
│ phone           │    │ is_system_role  │    │ first_name      │
│ email           │    │ created_at      │    │ last_name       │
│ is_active       │    │ updated_at      │    │ baptismal_name  │
│ created_at      │    └─────────────────┘    │ phone           │
│ updated_at      │                           │ branch_id (FK)  │
└─────────────────┘                           │ is_active       │
         │                                     │ last_login_at   │
         │                                     │ created_at      │
         │                                     │ updated_at      │
         │                                     └─────────────────┘
         │                                               │
         │                                               │
         │              ┌─────────────────┐              │
         │              │   USER_ROLES    │              │
         │              ├─────────────────┤              │
         │              │ id (PK, UUID)   │              │
         │              │ user_id (FK)    │              │
         │              │ role_id (FK)    │              │
         │              │ branch_id (FK)  │              │
         │              │ granted_by (FK) │              │
         │              │ is_active       │              │
         │              │ granted_at      │              │
         │              │ expires_at      │              │
         │              └─────────────────┘              │
         │                                               │
         │                                               │
         │              ┌─────────────────┐              │
         │              │    DOCUMENTS    │              │
         │              ├─────────────────┤              │
         │              │ id (PK, UUID)   │              │
         │              │ title           │              │
         │              │ content         │              │
         │              │ document_type   │              │
         │              │ document_number │              │
         │              │ status          │              │
         │              │ priority        │              │
         │              │ security_level  │              │
         │              │ author_id (FK)  │              │
         │              │ branch_id (FK)  │              │
         │              │ parent_doc_id   │              │
         │              │ version         │              │
         │              │ is_final        │              │
         │              │ created_at      │              │
         │              │ updated_at      │              │
         │              │ submitted_at    │              │
         │              │ approved_at     │              │
         │              │ rejected_at     │              │
         │              │ rejection_reason│              │
         │              └─────────────────┘              │
         │                       │                       │
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │  APPROVAL_LINES │              │
         │              ├─────────────────┤              │
         │              │ id (PK, UUID)   │              │
         │              │ document_id (FK)│              │
         │              │ name            │              │
         │              │ type            │              │
         │              │ is_parallel     │              │
         │              │ is_conditional  │              │
         │              │ status          │              │
         │              │ created_at      │              │
         │              │ updated_at      │              │
         │              └─────────────────┘              │
         │                       │                       │
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │ APPROVAL_STEPS  │              │
         │              ├─────────────────┤              │
         │              │ id (PK, UUID)   │              │
         │              │ approval_line_id│              │
         │              │ step_order      │              │
         │              │ approver_id (FK)│              │
         │              │ alternate_id    │              │
         │              │ step_type       │              │
         │              │ is_required     │              │
         │              │ is_delegatable  │              │
         │              │ status          │              │
         │              │ started_at      │              │
         │              │ completed_at    │              │
         │              │ due_date        │              │
         │              │ created_at      │              │
         │              │ updated_at      │              │
         │              └─────────────────┘              │
         │                       │                       │
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │ APPROVAL_HISTORY│              │
         │              ├─────────────────┤              │
         │              │ id (PK, UUID)   │              │
         │              │ document_id (FK)│              │
         │              │ approval_step_id│              │
         │              │ approver_id (FK)│              │
         │              │ action          │              │
         │              │ comment         │              │
         │              │ delegated_to_id │              │
         │              │ ip_address      │              │
         │              │ user_agent      │              │
         │              │ action_at       │              │
         │              │ created_at      │              │
         │              │ updated_at      │              │
         │              └─────────────────┘              │
         │                       │                       │
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │    COMMENTS     │              │
         │              ├─────────────────┤              │
         │              │ id (PK, UUID)   │              │
         │              │ document_id (FK)│              │
         │              │ author_id (FK)  │              │
         │              │ content         │              │
         │              │ comment_type    │              │
         │              │ is_internal     │              │
         │              │ parent_id (FK)  │              │
         │              │ created_at      │              │
         │              │ updated_at      │              │
         │              └─────────────────┘              │
         │                       │                       │
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │   ATTACHMENTS   │              │
         │              ├─────────────────┤              │
         │              │ id (PK, UUID)   │              │
         │              │ document_id (FK)│              │
         │              │ filename        │              │
         │              │ original_name   │              │
         │              │ file_path       │              │
         │              │ file_size       │              │
         │              │ mime_type       │              │
         │              │ uploaded_by (FK)│              │
         │              │ uploaded_at     │              │
         │              │ is_encrypted    │              │
         │              │ checksum        │              │
         │              │ created_at      │              │
         │              │ updated_at      │              │
         │              └─────────────────┘              │
         │                                               │
         │              ┌─────────────────┐              │
         │              │   AUDIT_LOGS    │              │
         │              ├─────────────────┤              │
         │              │ id (PK, UUID)   │              │
         │              │ user_id (FK)    │              │
         │              │ action          │              │
         │              │ resource_type   │              │
         │              │ resource_id     │              │
         │              │ details         │              │
         │              │ ip_address      │              │
         │              │ user_agent      │              │
         │              │ created_at      │              │
         │              │ updated_at      │              │
         │              └─────────────────┘              │
         │                                               │
         │              ┌─────────────────┐              │
         │              │    POLICIES     │              │
         │              ├─────────────────┤              │
         │              │ id (PK, UUID)   │              │
         │              │ name            │              │
         │              │ policy_type     │              │
         │              │ rules           │              │
         │              │ is_active       │              │
         │              │ created_by (FK) │              │
         │              │ created_at      │              │
         │              │ updated_at      │              │
         │              └─────────────────┘              │
         │                                               │
         │              ┌─────────────────┐              │
         │              │  NOTIFICATIONS  │              │
         │              ├─────────────────┤              │
         │              │ id (PK, UUID)   │              │
         │              │ user_id (FK)    │              │
         │              │ type            │              │
         │              │ title           │              │
         │              │ content         │              │
         │              │ is_read         │              │
         │              │ created_at      │              │
         │              │ updated_at      │              │
         │              └─────────────────┘              │
         └───────────────────────────────────────────────┘
```

## 테이블 상세 설계

### 1. BRANCHES (지사/분원)
```sql
CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 2. ROLES (역할)
```sql
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '{}',
    is_system_role BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 3. USERS (사용자)
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    baptismal_name VARCHAR(50) NOT NULL, -- 세례명 (필수)
    phone VARCHAR(20),
    branch_id UUID REFERENCES branches(id),
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 4. USER_ROLES (사용자-역할 매핑)
```sql
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id),
    granted_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, role_id, branch_id)
);
```

### 5. DOCUMENTS (문서)
```sql
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    content TEXT,
    document_type VARCHAR(50) NOT NULL,
    security_level VARCHAR(20) NOT NULL DEFAULT 'GENERAL',
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
    document_number VARCHAR(50) UNIQUE,
    author_id UUID NOT NULL REFERENCES users(id),
    branch_id UUID NOT NULL REFERENCES branches(id),
    parent_document_id UUID REFERENCES documents(id),
    version INTEGER DEFAULT 1,
    is_final BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE,
    rejected_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT
);
```

### 6. APPROVAL_LINES (결재선)
```sql
CREATE TABLE approval_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL, -- SEQUENTIAL, PARALLEL, CONDITIONAL
    is_parallel BOOLEAN DEFAULT false,
    is_conditional BOOLEAN DEFAULT false,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 7. APPROVAL_STEPS (결재 단계)
```sql
CREATE TABLE approval_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    approval_line_id UUID NOT NULL REFERENCES approval_lines(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    approver_id UUID NOT NULL REFERENCES users(id),
    alternate_approver_id UUID REFERENCES users(id),
    step_type VARCHAR(20) NOT NULL, -- REVIEW, APPROVE, CONSULT
    is_required BOOLEAN DEFAULT true,
    is_delegatable BOOLEAN DEFAULT false,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 8. APPROVAL_HISTORY (결재 이력)
```sql
CREATE TABLE approval_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id),
    approval_step_id UUID NOT NULL REFERENCES approval_steps(id),
    approver_id UUID NOT NULL REFERENCES users(id),
    action VARCHAR(20) NOT NULL, -- APPROVE, REJECT, RETURN, DELEGATE
    comment TEXT,
    delegated_to_id UUID REFERENCES users(id),
    ip_address INET,
    user_agent TEXT,
    action_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 9. COMMENTS (의견/댓글)
```sql
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    comment_type VARCHAR(20) NOT NULL DEFAULT 'GENERAL',
    is_internal BOOLEAN DEFAULT false,
    parent_comment_id UUID REFERENCES comments(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 10. ATTACHMENTS (첨부파일)
```sql
CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_encrypted BOOLEAN DEFAULT false,
    checksum VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 11. AUDIT_LOGS (감사 로그)
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(255),
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 12. POLICIES (정책)
```sql
CREATE TABLE policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    policy_type VARCHAR(50) NOT NULL,
    rules JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 13. NOTIFICATIONS (알림)
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## 인덱스 설계

### 성능 최적화를 위한 인덱스
```sql
-- UUID 확장 기능 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 사용자 관련 인덱스
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_branch_id ON users(branch_id);
CREATE INDEX idx_users_is_active ON users(is_active);

-- 문서 관련 인덱스
CREATE INDEX idx_documents_author_id ON documents(author_id);
CREATE INDEX idx_documents_branch_id ON documents(branch_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_created_at ON documents(created_at);
CREATE INDEX idx_documents_document_type ON documents(document_type);
CREATE INDEX idx_documents_security_level ON documents(security_level);
CREATE INDEX idx_documents_document_number ON documents(document_number);

-- 결재 관련 인덱스
CREATE INDEX idx_approval_lines_document_id ON approval_lines(document_id);
CREATE INDEX idx_approval_steps_approval_line_id ON approval_steps(approval_line_id);
CREATE INDEX idx_approval_steps_approver_id ON approval_steps(approver_id);
CREATE INDEX idx_approval_steps_status ON approval_steps(status);
CREATE INDEX idx_approval_history_document_id ON approval_history(document_id);
CREATE INDEX idx_approval_history_approver_id ON approval_history(approver_id);

-- 댓글 관련 인덱스
CREATE INDEX idx_comments_document_id ON comments(document_id);
CREATE INDEX idx_comments_author_id ON comments(author_id);
CREATE INDEX idx_comments_created_at ON comments(created_at);

-- 첨부파일 관련 인덱스
CREATE INDEX idx_attachments_document_id ON attachments(document_id);
CREATE INDEX idx_attachments_uploaded_by ON attachments(uploaded_by);

-- 감사 로그 관련 인덱스
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);

-- 알림 관련 인덱스
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
```

## 보안 설정

### 1. Row Level Security (RLS)
```sql
-- 사용자별 데이터 접근 제어
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- 정책 예시 (문서 접근)
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

### 2. 암호화 설정
```sql
-- 민감 데이터 암호화를 위한 확장 기능
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 암호화 함수 예시
CREATE OR REPLACE FUNCTION encrypt_sensitive_data(data TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN encode(encrypt(data::bytea, 'encryption_key', 'aes'), 'base64');
END;
$$ LANGUAGE plpgsql;
```

## 초기 데이터 (Seed Data)

### 기본 역할 데이터
```sql
INSERT INTO roles (name, description, permissions, is_system_role) VALUES
('SUPER_ADMIN', '최고 관리자', '{"system.manage": true, "user.manage": true, "audit.view": true}', true),
('MANAGER', '관리자', '{"document.create": true, "document.approve_all": true, "document.view_all": true, "policy.manage": true}', false),
('SUPERVISOR', '감독자', '{"document.create": true, "document.approve_dept": true, "document.view_dept": true}', false),
('SENIOR', '선임자', '{"document.create": true, "document.approve_team": true, "document.view_team": true}', false),
('USER', '일반 사용자', '{"document.create": true, "document.view_own": true}', false);
```

### 기본 지사 데이터
```sql
INSERT INTO branches (name, code, address, phone, email) VALUES
('본원', 'HQ', '서울특별시 강남구', '02-1234-5678', 'hq@brotherhood.or.kr'),
('부산지사', 'BUSAN', '부산광역시 해운대구', '051-1234-5678', 'busan@brotherhood.or.kr'),
('대구지사', 'DAEGU', '대구광역시 중구', '053-1234-5678', 'daegu@brotherhood.or.kr');
```

### 기본 사용자 데이터
```sql
INSERT INTO users (username, email, password_hash, first_name, last_name, baptismal_name, phone, branch_id) VALUES
('admin', 'admin@brotherhood.or.kr', '$2a$10$encrypted_password_hash', '관리자', '김', '요한', '010-1234-5678', (SELECT id FROM branches WHERE code = 'HQ')),
('manager1', 'manager1@brotherhood.or.kr', '$2a$10$encrypted_password_hash', '책임자', '이', '마리아', '010-2345-6789', (SELECT id FROM branches WHERE code = 'HQ')),
('user1', 'user1@brotherhood.or.kr', '$2a$10$encrypted_password_hash', '일반사용자', '박', '요셉', '010-3456-7890', (SELECT id FROM branches WHERE code = 'HQ'));
```

### 기본 사용자-역할 매핑 데이터
```sql
INSERT INTO user_roles (user_id, role_id, branch_id, granted_by, is_active) VALUES
((SELECT id FROM users WHERE username = 'admin'), (SELECT id FROM roles WHERE name = 'SUPER_ADMIN'), (SELECT id FROM branches WHERE code = 'HQ'), (SELECT id FROM users WHERE username = 'admin'), true),
((SELECT id FROM users WHERE username = 'manager1'), (SELECT id FROM roles WHERE name = 'MANAGER'), (SELECT id FROM branches WHERE code = 'HQ'), (SELECT id FROM users WHERE username = 'admin'), true),
((SELECT id FROM users WHERE username = 'user1'), (SELECT id FROM roles WHERE name = 'USER'), (SELECT id FROM branches WHERE code = 'HQ'), (SELECT id FROM users WHERE username = 'admin'), true);
```

## 데이터베이스 마이그레이션

### Flyway 마이그레이션 파일 구조
```
src/main/resources/db/migration/
├── V1__init.sql          # 초기 스키마 생성 (UUID 기반)
├── V2__seed_data.sql     # 초기 데이터 삽입
```

### 주요 변경사항
1. **UUID 도입**: 모든 기본키를 UUID로 변경하여 확장성과 보안 향상
2. **user_roles 테이블 개선**: 지사별 역할 관리 및 만료일 지원
3. **documents 테이블 확장**: 문서 번호, 거부 사유 등 필드 추가
4. **approval_history 테이블 추가**: 결재 이력 추적 강화
5. **notifications 테이블 추가**: 시스템 알림 기능 지원

이 설계는 로컬 개발 환경에 최적화되어 있으며, UUID 기반으로 확장성과 보안을 강화했습니다.