
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'contractors' AND column_name = 'username') THEN
        ALTER TABLE contractors ADD COLUMN username VARCHAR(100) UNIQUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'contractors' AND column_name = 'password_hash') THEN
        ALTER TABLE contractors ADD COLUMN password_hash VARCHAR(255);
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS contractor_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  contractor_id UUID REFERENCES contractors(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_contractors_username') THEN
        CREATE INDEX idx_contractors_username ON contractors(username);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_contractor_sessions_token') THEN
        CREATE INDEX idx_contractor_sessions_token ON contractor_sessions(session_token);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_contractor_sessions_expires_at') THEN
        CREATE INDEX idx_contractor_sessions_expires_at ON contractor_sessions(expires_at);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'contractor_sessions' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE contractor_sessions ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'contractor_sessions' 
        AND policyname = 'Allow all for service role'
    ) THEN
        CREATE POLICY "Allow all for service role" ON contractor_sessions 
        FOR ALL USING (auth.role() = 'service_role');
    END IF;
END $$;

UPDATE contractors 
SET username = LOWER(REPLACE(SPLIT_PART(email, '@', 1), '.', ''))
WHERE username IS NULL;

UPDATE contractors 
SET password_hash = '$2b$12$LQv3c1yqBwEHXLAw98HtQeOsYDdCcjqd8RfBzv3oeVhQBZtQpHyC2'  -- default: 'temppassword123'
WHERE password_hash IS NULL;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contractors' 
        AND column_name = 'username' 
        AND is_nullable = 'YES'
    ) THEN
        ALTER TABLE contractors ALTER COLUMN username SET NOT NULL;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contractors' 
        AND column_name = 'password_hash' 
        AND is_nullable = 'YES'
    ) THEN
        ALTER TABLE contractors ALTER COLUMN password_hash SET NOT NULL;
    END IF;
END $$;
