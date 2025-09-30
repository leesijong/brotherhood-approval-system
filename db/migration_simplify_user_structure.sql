-- 사용자 정보 구조 단순화 마이그레이션
-- 실행일: 2025-09-23
-- 목적: first_name, last_name, username을 name으로 통합

-- 1. name 컬럼 추가 (기존 username을 name으로 복사)
ALTER TABLE users ADD COLUMN name VARCHAR(100);

-- 2. 기존 데이터를 name으로 복사 (first_name + last_name 조합)
UPDATE users SET name = CONCAT(first_name, ' ', last_name) WHERE first_name IS NOT NULL AND last_name IS NOT NULL;

-- 3. username이 있는 경우 name으로 복사
UPDATE users SET name = username WHERE name IS NULL AND username IS NOT NULL;

-- 4. name이 NULL인 경우 기본값 설정
UPDATE users SET name = '사용자' WHERE name IS NULL;

-- 5. name 컬럼을 NOT NULL로 변경
ALTER TABLE users ALTER COLUMN name SET NOT NULL;

-- 6. 기존 컬럼들 제거
ALTER TABLE users DROP COLUMN IF EXISTS first_name;
ALTER TABLE users DROP COLUMN IF EXISTS last_name;
ALTER TABLE users DROP COLUMN IF EXISTS username;

-- 7. name 컬럼에 인덱스 추가 (검색 성능 향상)
CREATE INDEX idx_users_name ON users(name);

-- 8. 마이그레이션 완료 로그
INSERT INTO audit_logs (id, user_id, action, resource_type, resource_id, details, action_at)
VALUES (
    uuid_generate_v4(),
    (SELECT id FROM users WHERE email = 'admin@brotherhood.kr' LIMIT 1),
    'MIGRATION',
    'USERS',
    'ALL',
    '사용자 정보 구조 단순화: first_name, last_name, username을 name으로 통합',
    CURRENT_TIMESTAMP
);
