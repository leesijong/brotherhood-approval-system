-- 첨부파일 테이블에 stored_filename 필드 추가
-- 기존 original_filename 필드 제거 (filename과 중복)

-- stored_filename 필드 추가
ALTER TABLE attachments ADD COLUMN stored_filename VARCHAR(255);

-- 기존 데이터 마이그레이션 (filename을 stored_filename으로 복사)
UPDATE attachments SET stored_filename = filename WHERE stored_filename IS NULL;

-- stored_filename을 NOT NULL로 변경
ALTER TABLE attachments ALTER COLUMN stored_filename SET NOT NULL;

-- original_filename 필드 제거
ALTER TABLE attachments DROP COLUMN IF EXISTS original_filename;

-- 불필요한 필드들 제거 (현재 구현에서 사용하지 않음)
ALTER TABLE attachments DROP COLUMN IF EXISTS checksum;
ALTER TABLE attachments DROP COLUMN IF EXISTS is_encrypted;
ALTER TABLE attachments DROP COLUMN IF EXISTS encryption_key_id;
ALTER TABLE attachments DROP COLUMN IF EXISTS description;

-- uploaded_at 필드에 기본값 설정
ALTER TABLE attachments ALTER COLUMN uploaded_at SET DEFAULT CURRENT_TIMESTAMP;
