-- 데이터베이스 컬럼 동기화 스크립트
-- 엔티티와 스키마 불일치 해결

-- 1. approval_steps 테이블에 누락된 컬럼들 추가
ALTER TABLE approval_steps ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'PENDING';
ALTER TABLE approval_steps ADD COLUMN IF NOT EXISTS is_conditional BOOLEAN DEFAULT false;
ALTER TABLE approval_steps ADD COLUMN IF NOT EXISTS condition_expression TEXT;
ALTER TABLE approval_steps ADD COLUMN IF NOT EXISTS alternate_approver_id UUID REFERENCES users(id);
ALTER TABLE approval_steps ADD COLUMN IF NOT EXISTS comments TEXT;
ALTER TABLE approval_steps ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE approval_steps ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE approval_steps ADD COLUMN IF NOT EXISTS delegated_at TIMESTAMP WITH TIME ZONE;

-- 2. approval_lines 테이블에 누락된 컬럼 추가
ALTER TABLE approval_lines ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- 3. comments 테이블에 누락된 컬럼 추가
ALTER TABLE comments ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT false;

-- 4. attachments 테이블에 누락된 컬럼들 추가
ALTER TABLE attachments ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE attachments ADD COLUMN IF NOT EXISTS description TEXT;

-- 5. audit_logs 테이블에 누락된 컬럼들 추가
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS action_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS error_message TEXT;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS session_id VARCHAR(255);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS is_successful BOOLEAN;

-- 6. audit_logs 테이블의 id 컬럼 타입 수정 (String -> UUID)
-- 먼저 기존 데이터가 있는지 확인하고 처리
DO $$
BEGIN
    -- id 컬럼이 VARCHAR인 경우 UUID로 변경
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'audit_logs' 
        AND column_name = 'id' 
        AND data_type = 'character varying'
    ) THEN
        -- 기존 데이터가 있다면 임시 컬럼으로 백업
        ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS id_backup VARCHAR;
        UPDATE audit_logs SET id_backup = id WHERE id_backup IS NULL;
        
        -- id 컬럼을 UUID로 변경
        ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_pkey;
        ALTER TABLE audit_logs ALTER COLUMN id TYPE UUID USING id::UUID;
        ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);
        
        -- 백업 컬럼 삭제
        ALTER TABLE audit_logs DROP COLUMN IF EXISTS id_backup;
    END IF;
END $$;

-- 7. resource_id 컬럼 타입 수정 (UUID -> String)
ALTER TABLE audit_logs ALTER COLUMN resource_id TYPE VARCHAR(255);

-- 8. 업데이트 트리거 추가 (updated_at 자동 업데이트)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- approval_lines 테이블에 업데이트 트리거 추가
DROP TRIGGER IF EXISTS update_approval_lines_updated_at ON approval_lines;
CREATE TRIGGER update_approval_lines_updated_at
    BEFORE UPDATE ON approval_lines
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- comments 테이블에 업데이트 트리거 추가
DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 9. 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_approval_steps_status ON approval_steps(status);
CREATE INDEX IF NOT EXISTS idx_approval_steps_alternate_approver_id ON approval_steps(alternate_approver_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_at ON audit_logs(action_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs(resource_type);

-- 완료 메시지
SELECT 'Database schema synchronization completed successfully!' as message;
