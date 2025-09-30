-- 결재 시스템 데이터베이스 스키마 (PostgreSQL 16)
-- 배포용 통합 스키마 및 시드 데이터
-- 생성일: 2024-09-30

-- 확장 기능 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. 지사(Branch) 테이블
CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    parent_id UUID REFERENCES branches(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. 역할(Role) 테이블
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    is_system_role BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. 사용자(User) 테이블
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,  -- 사용자 이름
    login_id VARCHAR(50) NOT NULL UNIQUE,  -- 로그인 ID
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    baptismal_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    branch_id UUID NOT NULL REFERENCES branches(id),
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. 사용자-역할 매핑 테이블
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id),
    granted_by UUID REFERENCES users(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(user_id, role_id, branch_id)
);

-- 5. 정책(Policy) 테이블
CREATE TABLE policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    policy_type VARCHAR(50) NOT NULL,
    policy_data JSONB,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. 문서(Document) 테이블
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    content TEXT,
    document_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    priority VARCHAR(10) NOT NULL DEFAULT 'MEDIUM',
    author_id UUID NOT NULL REFERENCES users(id),
    branch_id UUID NOT NULL REFERENCES branches(id),
    document_number VARCHAR(50) UNIQUE,
    submitted_at TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE,
    rejected_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. 결재선(ApprovalLine) 테이블
CREATE TABLE approval_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    line_name VARCHAR(100) NOT NULL,
    line_order INTEGER NOT NULL DEFAULT 1,
    is_parallel BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. 결재단계(ApprovalStep) 테이블
CREATE TABLE approval_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    approval_line_id UUID NOT NULL REFERENCES approval_lines(id) ON DELETE CASCADE,
    approver_id UUID NOT NULL REFERENCES users(id),
    step_order INTEGER NOT NULL,
    is_required BOOLEAN DEFAULT true,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    comments TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    rejected_at TIMESTAMP WITH TIME ZONE,
    delegated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. 결재이력(ApprovalHistory) 테이블
CREATE TABLE approval_histories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    approval_step_id UUID REFERENCES approval_steps(id),
    action VARCHAR(20) NOT NULL,
    comments TEXT,
    performed_by UUID NOT NULL REFERENCES users(id),
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT
);

-- 10. 첨부파일(Attachment) 테이블
CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    original_name VARCHAR(255) NOT NULL,
    stored_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100),
    uploaded_by UUID NOT NULL REFERENCES users(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. 댓글(Comment) 테이블
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    parent_id UUID REFERENCES comments(id),
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. 알림(Notification) 테이블
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    is_read BOOLEAN DEFAULT false,
    related_document_id UUID REFERENCES documents(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. 감사로그(AuditLog) 테이블
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX idx_users_login_id ON users(login_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_documents_author_id ON documents(author_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_approval_steps_approver_id ON approval_steps(approver_id);
CREATE INDEX idx_approval_steps_status ON approval_steps(status);
CREATE INDEX idx_approval_histories_document_id ON approval_histories(document_id);
CREATE INDEX idx_attachments_document_id ON attachments(document_id);
CREATE INDEX idx_comments_document_id ON comments(document_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- 시드 데이터 삽입

-- 1. 지사 데이터
INSERT INTO branches (id, name, code, address, phone, email, parent_id, is_active) VALUES
    ('550e8400-e29b-41d4-a716-446655440000', '본원', 'HQ', '서울특별시 강남구 테헤란로 123', '02-1234-5678', 'hq@brotherhood.or.kr', NULL, true),
    ('550e8400-e29b-41d4-a716-446655440001', '부산지사', 'BUSAN', '부산광역시 해운대구 센텀중앙로 456', '051-1234-5678', 'busan@brotherhood.or.kr', '550e8400-e29b-41d4-a716-446655440000', true),
    ('550e8400-e29b-41d4-a716-446655440002', '대구지사', 'DAEGU', '대구광역시 수성구 동대구로 789', '053-1234-5678', 'daegu@brotherhood.or.kr', '550e8400-e29b-41d4-a716-446655440000', true);

-- 2. 역할 데이터
INSERT INTO roles (id, name, description, is_system_role) VALUES
    ('650e8400-e29b-41d4-a716-446655440000', 'SUPER_ADMIN', '시스템 최고 관리자', true),
    ('650e8400-e29b-41d4-a716-446655440001', 'ADMIN', '관리자', true),
    ('650e8400-e29b-41d4-a716-446655440002', 'MANAGER', '중간 관리자', false),
    ('650e8400-e29b-41d4-a716-446655440003', 'SUPERVISOR', '책임자', false),
    ('650e8400-e29b-41d4-a716-446655440004', 'SENIOR', '장상', false),
    ('650e8400-e29b-41d4-a716-446655440005', 'USER', '일반 사용자', false);

-- 3. 사용자 데이터 (비밀번호: admin123)
INSERT INTO users (id, name, login_id, email, password_hash, baptismal_name, phone, branch_id, is_active) VALUES
    ('750e8400-e29b-41d4-a716-446655440000', '관리자', 'admin', 'admin@brotherhood.or.kr', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', '요한', '010-1234-5678', '550e8400-e29b-41d4-a716-446655440000', true),
    ('750e8400-e29b-41d4-a716-446655440001', '중간관리자', 'manager1', 'manager1@brotherhood.or.kr', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', '바오로', '010-2345-6789', '550e8400-e29b-41d4-a716-446655440000', true),
    ('750e8400-e29b-41d4-a716-446655440002', '일반사용자', 'test_id01', 'user1@brotherhood.or.kr', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', '마태오', '010-5678-9012', '550e8400-e29b-41d4-a716-446655440000', true);

-- 4. 사용자-역할 매핑
INSERT INTO user_roles (id, user_id, role_id, branch_id, granted_by, is_active) VALUES
    ('850e8400-e29b-41d4-a716-446655440000', '750e8400-e29b-41d4-a716-446655440000', '650e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', '750e8400-e29b-41d4-a716-446655440000', true),
    ('850e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', '750e8400-e29b-41d4-a716-446655440000', true),
    ('850e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440000', '750e8400-e29b-41d4-a716-446655440000', true);

-- 5. 정책 데이터
INSERT INTO policies (id, name, description, policy_type, policy_data, is_active, created_by) VALUES
    ('950e8400-e29b-41d4-a716-446655440000', '기본 결재 정책', '일반적인 결재 프로세스 정책', 'APPROVAL_POLICY', 
     '{"max_approval_steps": 5, "allow_parallel": true, "allow_delegation": true, "max_delegation_level": 2}', 
     true, '750e8400-e29b-41d4-a716-446655440000');

-- 완료 메시지
SELECT 'Database schema and seed data created successfully!' as status;
