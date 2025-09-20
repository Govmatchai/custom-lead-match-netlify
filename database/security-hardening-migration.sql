CREATE TABLE IF NOT EXISTS rate_limit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  identifier VARCHAR(255) NOT NULL,
  endpoint VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_logs_identifier ON rate_limit_logs(identifier);
CREATE INDEX IF NOT EXISTS idx_rate_limit_logs_endpoint ON rate_limit_logs(endpoint);
CREATE INDEX IF NOT EXISTS idx_rate_limit_logs_created_at ON rate_limit_logs(created_at);

CREATE TABLE IF NOT EXISTS contractor_2fa (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  contractor_id UUID REFERENCES contractors(id) ON DELETE CASCADE,
  secret VARCHAR(255) NOT NULL,
  enabled BOOLEAN DEFAULT false,
  backup_codes TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(contractor_id)
);

CREATE TABLE IF NOT EXISTS admin_2fa (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_email VARCHAR(255) NOT NULL,
  secret VARCHAR(255) NOT NULL,
  enabled BOOLEAN DEFAULT false,
  backup_codes TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(admin_email)
);

ALTER TABLE contractor_sessions ADD COLUMN IF NOT EXISTS ip_address INET;
ALTER TABLE contractor_sessions ADD COLUMN IF NOT EXISTS user_agent TEXT;
ALTER TABLE contractor_sessions ADD COLUMN IF NOT EXISTS refresh_token VARCHAR(255);
ALTER TABLE contractor_sessions ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW();

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'contractors_phone_check') THEN
    ALTER TABLE contractors ADD CONSTRAINT contractors_phone_check 
    CHECK (phone ~ '^\+?[1-9]\d{1,14}$');
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'contractors_wallet_balance_check') THEN
    ALTER TABLE contractors ADD CONSTRAINT contractors_wallet_balance_check 
    CHECK (wallet_balance >= 0);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'leads_price_check') THEN
    ALTER TABLE leads ADD CONSTRAINT leads_price_check 
    CHECK (price >= 0);
  END IF;
END $$;

ALTER TABLE rate_limit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_2fa ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_2fa ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for service role" ON rate_limit_logs FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow all for service role" ON contractor_2fa FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow all for service role" ON admin_2fa FOR ALL USING (auth.role() = 'service_role');

CREATE OR REPLACE FUNCTION create_rate_limit_table_if_not_exists()
RETURNS void AS $$
BEGIN
  RETURN;
END;
$$ LANGUAGE plpgsql;
