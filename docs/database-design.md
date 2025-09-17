# 데이터베이스 설계 및 ERD

## 데이터베이스 개요

### 기본 정보
- **데이터베이스**: PostgreSQL 16.1
- **인코딩**: UTF-8
- **로케일**: ko_KR.UTF-8
- **타임존**: Asia/Seoul

### 설계 원칙
1. **정규화**: 3NF 이상 준수
2. **보안**: 민감 데이터 암호화
3. **성능**: 적절한 인덱스 설계
4. **확장성**: 지사별 멀티테넌시 지원
5. **감사**: 모든 변경사항 추적

## ERD (Entity Relationship Diagram)

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     BRANCHES    │    │      ROLES      │    │      USERS      │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (PK)         │    │ id (PK)         │    │ id (PK)         │
│ name            │    │ name            │    │ username        │
│ code            │    │ description     │    │ email           │
│ country         │    │ permissions     │    │ password_hash   │
│ created_at      │    │ created_at      │    │ first_name      │
│ updated_at      │    │ updated_at      │    │ last_name       │
│ baptismal_name  │
│ phone           │
└─────────────────┘    └─────────────────┘    │ branch_id (FK)  │
         │                       │             │ is_active       │
         │                       │             │ created_at      │
         │                       │             │ updated_at      │
         │                       │             └─────────────────┘
         │                       │                       │
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │   USER_ROLES    │              │
         │              ├─────────────────┤              │
         │              │ user_id (FK)    │              │
         │              │ role_id (FK)    │              │
         │              │ assigned_at     │              │
         │              └─────────────────┘              │
         │                                               │
         │                                               │
         │              ┌─────────────────┐              │
         │              │    DOCUMENTS    │              │
         │              ├─────────────────┤              │
         │              │ id (PK)         │              │
         │              │ title           │              │
         │              │ content         │              │
         │              │ document_type   │              │
         │              │ status          │              │
         │              │ priority        │              │
         │              │ security_level  │              │
         │              │ author_id (FK)  │              │
         │              │ branch_id (FK)  │              │
         │              │ created_at      │              │
         │              │ updated_at      │              │
         │              │ submitted_at    │              │
         │              │ completed_at    │              │
         │              └─────────────────┘              │
         │                       │                       │
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │  APPROVAL_LINES │              │
         │              ├─────────────────┤              │
         │              │ id (PK)         │              │
         │              │ document_id (FK)│              │
         │              │ name            │              │
         │              │ type            │              │
         │              │ status          │              │
         │              │ created_at      │              │
         │              │ updated_at      │              │
         │              └─────────────────┘              │
         │                       │                       │
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │ APPROVAL_STEPS  │              │
         │              ├─────────────────┤              │
         │              │ id (PK)         │              │
         │              │ approval_line_id│              │
         │              │ step_order      │              │
         │              │ approver_id (FK)│              │
         │              │ step_type       │              │
         │              │ status          │              │
         │              │ started_at      │              │
         │              │ completed_at    │              │
         │              │ due_date        │              │
         │              └─────────────────┘              │
         │                       │                       │
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │    COMMENTS     │              │
         │              ├─────────────────┤              │
         │              │ id (PK)         │              │
         │              │ document_id (FK)│              │
         │              │ author_id (FK)  │              │
         │              │ content         │              │
         │              │ comment_type    │              │
         │              │ is_internal     │              │
         │              │ created_at      │              │
         │              │ updated_at      │              │
         │              └─────────────────┘              │
         │                       │                       │
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │   ATTACHMENTS   │              │
         │              ├─────────────────┤              │
         │              │ id (PK)         │              │
         │              │ document_id (FK)│              │
         │              │ filename        │              │
         │              │ original_name   │              │
         │              │ file_path       │              │
         │              │ file_size       │              │
         │              │ mime_type       │              │
         │              │ uploaded_by (FK)│              │
         │              │ uploaded_at     │              │
         │              │ is_encrypted    │              │
         │              └─────────────────┘              │
         │                                               │
         │              ┌─────────────────┐              │
         │              │   AUDIT_LOGS    │              │
         │              ├─────────────────┤              │
         │              │ id (PK)         │              │
         │              │ user_id (FK)    │              │
         │              │ action          │              │
         │              │ resource_type   │              │
         │              │ resource_id     │              │
         │              │ details         │              │
         │              │ ip_address      │              │
         │              │ user_agent      │              │
         │              │ created_at      │              │
         │              └─────────────────┘              │
         │                                               │
         │              ┌─────────────────┐              │
         │              │    POLICIES     │              │
         │              ├─────────────────┤              │
         │              │ id (PK)         │              │
         │              │ name            │              │
         │              │ policy_type     │              │
         │              │ rules           │              │
         │              │ is_active       │              │
         │              │ created_by (FK) │              │
         │              │ created_at      │              │
         │              │ updated_at      │              │
         │              └─────────────────┘              │
         └───────────────────────────────────────────────┘
```

## 테이블 상세 설계

### 1. BRANCHES (지사/분원)
```sql
CREATE TABLE branches (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    country VARCHAR(50) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. ROLES (역할)
```sql
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '{}',
    is_system_role BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. USERS (사용자)
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    baptismal_name VARCHAR(50) NOT NULL, -- 세례명 (필수)
    phone VARCHAR(20),
    branch_id BIGINT REFERENCES branches(id),
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP,
    password_changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. USER_ROLES (사용자-역할 매핑)
```sql
CREATE TABLE user_roles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by BIGINT REFERENCES users(id),
    UNIQUE(user_id, role_id)
);
```

### 5. DOCUMENTS (문서)
```sql
CREATE TABLE documents (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    priority VARCHAR(10) NOT NULL DEFAULT 'NORMAL',
    security_level VARCHAR(20) NOT NULL DEFAULT 'GENERAL',
    author_id BIGINT REFERENCES users(id),
    branch_id BIGINT REFERENCES branches(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP,
    completed_at TIMESTAMP,
    version INTEGER DEFAULT 1
);
```

### 6. APPROVAL_LINES (결재선)
```sql
CREATE TABLE approval_lines (
    id BIGSERIAL PRIMARY KEY,
    document_id BIGINT REFERENCES documents(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL, -- SEQUENTIAL, PARALLEL, CONDITIONAL
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 7. APPROVAL_STEPS (결재 단계)
```sql
CREATE TABLE approval_steps (
    id BIGSERIAL PRIMARY KEY,
    approval_line_id BIGINT REFERENCES approval_lines(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    approver_id BIGINT REFERENCES users(id),
    step_type VARCHAR(20) NOT NULL, -- REVIEW, APPROVE, CONSULT
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    due_date TIMESTAMP,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 8. COMMENTS (의견/댓글)
```sql
CREATE TABLE comments (
    id BIGSERIAL PRIMARY KEY,
    document_id BIGINT REFERENCES documents(id) ON DELETE CASCADE,
    author_id BIGINT REFERENCES users(id),
    content TEXT NOT NULL,
    comment_type VARCHAR(20) NOT NULL DEFAULT 'GENERAL',
    is_internal BOOLEAN DEFAULT false,
    parent_id BIGINT REFERENCES comments(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 9. ATTACHMENTS (첨부파일)
```sql
CREATE TABLE attachments (
    id BIGSERIAL PRIMARY KEY,
    document_id BIGINT REFERENCES documents(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    uploaded_by BIGINT REFERENCES users(id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_encrypted BOOLEAN DEFAULT false,
    checksum VARCHAR(64)
);
```

### 10. AUDIT_LOGS (감사 로그)
```sql
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id BIGINT,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 11. POLICIES (정책)
```sql
CREATE TABLE policies (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    policy_type VARCHAR(50) NOT NULL,
    rules JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 인덱스 설계

### 성능 최적화를 위한 인덱스
```sql
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

-- 결재 관련 인덱스
CREATE INDEX idx_approval_lines_document_id ON approval_lines(document_id);
CREATE INDEX idx_approval_steps_approval_line_id ON approval_steps(approval_line_id);
CREATE INDEX idx_approval_steps_approver_id ON approval_steps(approver_id);
CREATE INDEX idx_approval_steps_status ON approval_steps(status);

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
('GENERAL_MEMBER', '일반 수도자', '{"document.create": true, "document.view_own": true}', false),
('MIDDLE_MANAGER', '중간관리 수도자', '{"document.create": true, "document.approve_dept": true, "document.view_dept": true}', false),
('RESPONSIBLE_MANAGER', '책임 수도자', '{"document.create": true, "document.approve_institution": true, "document.view_institution": true, "policy.manage": true}', false),
('SUPERIOR', '장상', '{"document.create": true, "document.approve_all": true, "document.view_all": true, "policy.manage": true, "user.manage": true}', false),
('ADMIN', '시스템 관리자', '{"system.manage": true, "user.manage": true, "audit.view": true}', true);
```

### 기본 지사 데이터
```sql
INSERT INTO branches (name, code, country, address, phone, email) VALUES
('본원', 'HQ', 'Korea', '서울특별시 강남구', '02-1234-5678', 'hq@cckbm.org'),
('부산지사', 'BUSAN', 'Korea', '부산광역시 해운대구', '051-1234-5678', 'busan@cckbm.org'),
('대구지사', 'DAEGU', 'Korea', '대구광역시 중구', '053-1234-5678', 'daegu@cckbm.org');
```

### 기본 사용자 데이터
```sql
INSERT INTO users (username, email, password_hash, first_name, last_name, baptismal_name, phone, branch_id) VALUES
('admin', 'admin@cckbm.org', '$2a$10$encrypted_password_hash', '관리자', '김', '요한', '010-1234-5678', 1),
('superior1', 'superior1@cckbm.org', '$2a$10$encrypted_password_hash', '장상', '이', '마리아', '010-2345-6789', 1),
('manager1', 'manager1@cckbm.org', '$2a$10$encrypted_password_hash', '책임자', '박', '요셉', '010-3456-7890', 1),
('member1', 'member1@cckbm.org', '$2a$10$encrypted_password_hash', '수도자', '최', '테레사', '010-4567-8901', 1);
```

## 데이터베이스 마이그레이션

### Flyway 마이그레이션 파일 구조
```
src/main/resources/db/migration/
├── V1__init.sql          # 초기 스키마 생성
├── V2__add_indexes.sql   # 인덱스 추가
├── V3__add_rls.sql       # Row Level Security 설정
├── V4__add_functions.sql # 커스텀 함수 추가
└── V5__seed_data.sql     # 초기 데이터 삽입
```

이 설계는 로컬 개발 환경에 최적화되어 있으며, 향후 확장 시에도 유연하게 대응할 수 있도록 구성되었습니다.
