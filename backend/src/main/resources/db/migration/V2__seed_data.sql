-- Flyway 마이그레이션: 초기 시드 데이터 삽입
-- 버전: V2
-- 설명: 기본 역할, 지사, 사용자, 정책 데이터 삽입

-- 1. 지사 데이터 삽입
INSERT INTO branches (id, name, code, address, phone, email, parent_id, is_active) VALUES
    (uuid_generate_v4(), '본원', 'HQ', '서울특별시 강남구 테헤란로 123', '02-1234-5678', 'hq@brotherhood.or.kr', NULL, true),
    (uuid_generate_v4(), '부산지사', 'BUSAN', '부산광역시 해운대구 센텀중앙로 456', '051-1234-5678', 'busan@brotherhood.or.kr', (SELECT id FROM branches WHERE code = 'HQ'), true),
    (uuid_generate_v4(), '대구지사', 'DAEGU', '대구광역시 수성구 동대구로 789', '053-1234-5678', 'daegu@brotherhood.or.kr', (SELECT id FROM branches WHERE code = 'HQ'), true),
    (uuid_generate_v4(), '광주지사', 'GWANGJU', '광주광역시 서구 상무대로 321', '062-1234-5678', 'gwangju@brotherhood.or.kr', (SELECT id FROM branches WHERE code = 'HQ'), true),
    (uuid_generate_v4(), '대전지사', 'DAEJEON', '대전광역시 유성구 대학로 654', '042-1234-5678', 'daejeon@brotherhood.or.kr', (SELECT id FROM branches WHERE code = 'HQ'), true);

-- 2. 역할 데이터 삽입
INSERT INTO roles (id, name, description, is_system_role) VALUES
    (uuid_generate_v4(), 'SUPER_ADMIN', '시스템 최고 관리자', true),
    (uuid_generate_v4(), 'ADMIN', '관리자', true),
    (uuid_generate_v4(), 'MANAGER', '중간 관리자', false),
    (uuid_generate_v4(), 'SUPERVISOR', '책임자', false),
    (uuid_generate_v4(), 'SENIOR', '장상', false),
    (uuid_generate_v4(), 'USER', '일반 사용자', false);

-- 3. 사용자 데이터 삽입 (세례명 포함)
INSERT INTO users (id, username, email, password_hash, first_name, last_name, baptismal_name, phone, branch_id, is_active) VALUES
    (uuid_generate_v4(), 'admin', 'admin@brotherhood.or.kr', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', '관리자', '김', '요한', '010-1234-5678', (SELECT id FROM branches WHERE code = 'HQ'), true),
    (uuid_generate_v4(), 'manager1', 'manager1@brotherhood.or.kr', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', '중간관리자', '이', '바오로', '010-2345-6789', (SELECT id FROM branches WHERE code = 'HQ'), true),
    (uuid_generate_v4(), 'supervisor1', 'supervisor1@brotherhood.or.kr', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', '책임자', '박', '베드로', '010-3456-7890', (SELECT id FROM branches WHERE code = 'HQ'), true),
    (uuid_generate_v4(), 'senior1', 'senior1@brotherhood.or.kr', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', '장상', '최', '안드레아', '010-4567-8901', (SELECT id FROM branches WHERE code = 'HQ'), true),
    (uuid_generate_v4(), 'user1', 'user1@brotherhood.or.kr', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', '일반사용자', '정', '마태오', '010-5678-9012', (SELECT id FROM branches WHERE code = 'HQ'), true),
    (uuid_generate_v4(), 'busan_manager', 'busan_manager@brotherhood.or.kr', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', '부산지사장', '강', '야고보', '010-6789-0123', (SELECT id FROM branches WHERE code = 'BUSAN'), true),
    (uuid_generate_v4(), 'daegu_manager', 'daegu_manager@brotherhood.or.kr', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', '대구지사장', '윤', '요한', '010-7890-1234', (SELECT id FROM branches WHERE code = 'DAEGU'), true);

-- 4. 사용자-역할 매핑 데이터 삽입
INSERT INTO user_roles (user_id, role_id, branch_id, granted_by, is_active) VALUES
    -- 본원 사용자들
    ((SELECT id FROM users WHERE username = 'admin'), (SELECT id FROM roles WHERE name = 'SUPER_ADMIN'), (SELECT id FROM branches WHERE code = 'HQ'), (SELECT id FROM users WHERE username = 'admin'), true),
    ((SELECT id FROM users WHERE username = 'manager1'), (SELECT id FROM roles WHERE name = 'MANAGER'), (SELECT id FROM branches WHERE code = 'HQ'), (SELECT id FROM users WHERE username = 'admin'), true),
    ((SELECT id FROM users WHERE username = 'supervisor1'), (SELECT id FROM roles WHERE name = 'SUPERVISOR'), (SELECT id FROM branches WHERE code = 'HQ'), (SELECT id FROM users WHERE username = 'admin'), true),
    ((SELECT id FROM users WHERE username = 'senior1'), (SELECT id FROM roles WHERE name = 'SENIOR'), (SELECT id FROM branches WHERE code = 'HQ'), (SELECT id FROM users WHERE username = 'admin'), true),
    ((SELECT id FROM users WHERE username = 'user1'), (SELECT id FROM roles WHERE name = 'USER'), (SELECT id FROM branches WHERE code = 'HQ'), (SELECT id FROM users WHERE username = 'admin'), true),
    -- 지사 사용자들
    ((SELECT id FROM users WHERE username = 'busan_manager'), (SELECT id FROM roles WHERE name = 'MANAGER'), (SELECT id FROM branches WHERE code = 'BUSAN'), (SELECT id FROM users WHERE username = 'admin'), true),
    ((SELECT id FROM users WHERE username = 'daegu_manager'), (SELECT id FROM roles WHERE name = 'MANAGER'), (SELECT id FROM branches WHERE code = 'DAEGU'), (SELECT id FROM users WHERE username = 'admin'), true);

-- 5. 정책 데이터 삽입
INSERT INTO policies (id, name, description, policy_type, policy_data, is_active, created_by) VALUES
    (uuid_generate_v4(), '기본 결재 정책', '일반적인 결재 프로세스 정책', 'APPROVAL_POLICY', 
     '{"max_approval_steps": 5, "allow_parallel": true, "allow_delegation": true, "max_delegation_level": 2}'::jsonb, 
     true, (SELECT id FROM users WHERE username = 'admin')),
    
    (uuid_generate_v4(), '보안 문서 정책', '보안 등급 문서 처리 정책', 'SECURITY_POLICY', 
     '{"require_encryption": true, "audit_all_access": true, "watermark_documents": true}'::jsonb, 
     true, (SELECT id FROM users WHERE username = 'admin')),
    
    (uuid_generate_v4(), '지사 간 결재 정책', '지사 간 문서 결재 정책', 'CROSS_BRANCH_POLICY', 
     '{"allow_cross_branch": true, "require_hq_approval": true, "max_cross_branch_steps": 3}'::jsonb, 
     true, (SELECT id FROM users WHERE username = 'admin'));

-- 6. 샘플 문서 데이터 삽입
INSERT INTO documents (id, title, content, document_type, security_level, status, priority, author_id, branch_id, version, is_final) VALUES
    (uuid_generate_v4(), '2024년 예산 계획서', '2024년도 예산 계획에 대한 문서입니다.', 'BUDGET', 'GENERAL', 'DRAFT', 'HIGH', 
     (SELECT id FROM users WHERE username = 'manager1'), (SELECT id FROM branches WHERE code = 'HQ'), 1, false),
    
    (uuid_generate_v4(), '신규 직원 채용 계획', '2024년 하반기 신규 직원 채용 계획서입니다.', 'HR', 'GENERAL', 'SUBMITTED', 'NORMAL', 
     (SELECT id FROM users WHERE username = 'supervisor1'), (SELECT id FROM branches WHERE code = 'HQ'), 1, false),
    
    (uuid_generate_v4(), '보안 정책 개정안', '시스템 보안 정책 개정에 대한 문서입니다.', 'SECURITY', 'CONFIDENTIAL', 'DRAFT', 'HIGH', 
     (SELECT id FROM users WHERE username = 'admin'), (SELECT id FROM branches WHERE code = 'HQ'), 1, false);

-- 7. 샘플 결재선 데이터 삽입
INSERT INTO approval_lines (id, document_id, name, description, is_parallel, created_by) VALUES
    (uuid_generate_v4(), (SELECT id FROM documents WHERE title = '2024년 예산 계획서'), '예산 결재선', '2024년 예산 계획서 결재선', false, 
     (SELECT id FROM users WHERE username = 'manager1')),
    
    (uuid_generate_v4(), (SELECT id FROM documents WHERE title = '신규 직원 채용 계획'), '채용 계획 결재선', '신규 직원 채용 계획 결재선', false, 
     (SELECT id FROM users WHERE username = 'supervisor1'));

-- 8. 샘플 결재 단계 데이터 삽입
INSERT INTO approval_steps (id, approval_line_id, step_order, approver_id, approver_type, is_required, is_delegatable) VALUES
    -- 예산 계획서 결재선
    (uuid_generate_v4(), (SELECT id FROM approval_lines WHERE name = '예산 결재선'), 1, 
     (SELECT id FROM users WHERE username = 'supervisor1'), 'PERSON', true, true),
    (uuid_generate_v4(), (SELECT id FROM approval_lines WHERE name = '예산 결재선'), 2, 
     (SELECT id FROM users WHERE username = 'manager1'), 'PERSON', true, true),
    (uuid_generate_v4(), (SELECT id FROM approval_lines WHERE name = '예산 결재선'), 3, 
     (SELECT id FROM users WHERE username = 'admin'), 'PERSON', true, false),
    
    -- 채용 계획 결재선
    (uuid_generate_v4(), (SELECT id FROM approval_lines WHERE name = '채용 계획 결재선'), 1, 
     (SELECT id FROM users WHERE username = 'senior1'), 'PERSON', true, true),
    (uuid_generate_v4(), (SELECT id FROM approval_lines WHERE name = '채용 계획 결재선'), 2, 
     (SELECT id FROM users WHERE username = 'manager1'), 'PERSON', true, true);

-- 9. 샘플 댓글 데이터 삽입
INSERT INTO comments (id, document_id, author_id, content, is_internal) VALUES
    (uuid_generate_v4(), (SELECT id FROM documents WHERE title = '2024년 예산 계획서'), 
     (SELECT id FROM users WHERE username = 'supervisor1'), '예산 계획이 현실적으로 보입니다.', false),
    
    (uuid_generate_v4(), (SELECT id FROM documents WHERE title = '신규 직원 채용 계획'), 
     (SELECT id FROM users WHERE username = 'senior1'), '채용 인원을 조금 더 늘려야 할 것 같습니다.', false);

-- 10. 샘플 감사 로그 데이터 삽입
INSERT INTO audit_logs (id, user_id, action, resource_type, resource_id, old_values, new_values, ip_address) VALUES
    (uuid_generate_v4(), (SELECT id FROM users WHERE username = 'admin'), 'CREATE', 'DOCUMENT', 
     (SELECT id FROM documents WHERE title = '보안 정책 개정안'), 
     NULL, '{"title": "보안 정책 개정안", "status": "DRAFT"}'::jsonb, '127.0.0.1'),
    
    (uuid_generate_v4(), (SELECT id FROM users WHERE username = 'supervisor1'), 'SUBMIT', 'DOCUMENT', 
     (SELECT id FROM documents WHERE title = '신규 직원 채용 계획'), 
     '{"status": "DRAFT"}'::jsonb, '{"status": "SUBMITTED"}'::jsonb, '127.0.0.1');

