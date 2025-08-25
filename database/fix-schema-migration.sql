
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
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'contractors' AND column_name = 'wallet_balance') THEN
        ALTER TABLE contractors ADD COLUMN wallet_balance DECIMAL(10,2) DEFAULT 25.00;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'leads' AND column_name = 'email') THEN
        ALTER TABLE leads ADD COLUMN email VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'leads' AND column_name = 'status') THEN
        ALTER TABLE leads ADD COLUMN status VARCHAR(50) DEFAULT 'pending_review' 
        CHECK (status IN ('pending_review', 'valid', 'duplicate', 'invalid', 'claimed'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'leads' AND column_name = 'is_archived') THEN
        ALTER TABLE leads ADD COLUMN is_archived BOOLEAN DEFAULT false;
    END IF;
END $$;

UPDATE contractors 
SET username = LOWER(REPLACE(SPLIT_PART(email, '@', 1), '.', ''))
WHERE username IS NULL;

UPDATE contractors 
SET password_hash = '$2b$12$LQv3c1yqBwEHXLAw98HtQeOsYDdCcjqd8RfBzv3oeVhQBZtQpHyC2'  -- default: 'temppassword123'
WHERE password_hash IS NULL;

UPDATE contractors 
SET wallet_balance = 25.00
WHERE wallet_balance IS NULL;

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

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_contractors_username') THEN
        CREATE INDEX idx_contractors_username ON contractors(username);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_leads_status') THEN
        CREATE INDEX idx_leads_status ON leads(status);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_leads_is_archived') THEN
        CREATE INDEX idx_leads_is_archived ON leads(is_archived);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_leads_email') THEN
        CREATE INDEX idx_leads_email ON leads(email);
    END IF;
END $$;
