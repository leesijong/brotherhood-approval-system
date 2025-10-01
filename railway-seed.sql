-- Railway PostgreSQL 초기 데이터
-- Brotherhood Approval System

-- 1. 지사 데이터 (본원)
INSERT INTO branches (id, name, code, address, phone, email, is_active, created_at, updated_at)
VALUES 
('433fec24-b2b8-4b3c-a9a4-af9d69e104e3', '본원', 'HQ', '서울시 성북구 성북동 한국순교복자수도회', '02-1234-5678', 'hq@brotherhood.or.kr', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- 2. 역할 데이터
INSERT INTO roles (id, name, description, is_active, created_at, updated_at)
VALUES 
('1d8c3f4a-5b6e-4c7d-8a9b-0c1d2e3f4a5b', 'ADMIN', '시스템 관리자', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('2e9d4f5b-6c7e-5d8e-9b0c-1d2e3f4a5b6c', 'SUPER_ADMIN', '최고 관리자', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('3f0e5f6c-7d8f-6e9f-0c1d-2e3f4a5b6c7d', 'USER', '일반 사용자', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('4a1f6g7d-8e9g-7f0g-1d2e-3f4a5b6c7d8e', 'MANAGER', '중간 관리자', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('5b2g7h8e-9f0h-8g1h-2e3f-4a5b6c7d8e9f', 'SUPERIOR', '최고 책임자', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- 3. 관리자 사용자 (비밀번호: admin123)
-- BCrypt 해시: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhCu
INSERT INTO users (id, name, login_id, email, password_hash, baptismal_name, phone, branch_id, is_active, created_at, updated_at)
VALUES 
('ac31e829-d5c6-4a1d-92de-439178b12f5f', '관리자', 'admin', 'admin@brotherhood.or.kr', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhCu', '미카엘', '010-1234-5678', '433fec24-b2b8-4b3c-a9a4-af9d69e104e3', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- 4. 사용자-역할 매핑 (관리자에게 ADMIN 역할 부여)
INSERT INTO user_roles (id, user_id, role_id, branch_id, is_active, granted_at)
VALUES 
('6c3h8i9f-0g1i-9h2i-3f4g-5b6c7d8e9f0g', 'ac31e829-d5c6-4a1d-92de-439178b12f5f', '1d8c3f4a-5b6e-4c7d-8a9b-0c1d2e3f4a5b', '433fec24-b2b8-4b3c-a9a4-af9d69e104e3', true, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- 완료 메시지
SELECT '초기 데이터 생성 완료' as result;
SELECT '지사: ' || COUNT(*) || '개' as branches FROM branches;
SELECT '역할: ' || COUNT(*) || '개' as roles FROM roles;
SELECT '사용자: ' || COUNT(*) || '개' as users FROM users;
SELECT '로그인 정보: admin / admin123' as login_info;

