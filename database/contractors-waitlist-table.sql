CREATE TABLE IF NOT EXISTS contractors_waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  trade VARCHAR(100) NOT NULL,
  signup_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contractors_waitlist_email ON contractors_waitlist(email);
CREATE INDEX IF NOT EXISTS idx_contractors_waitlist_trade ON contractors_waitlist(trade);
CREATE INDEX IF NOT EXISTS idx_contractors_waitlist_signup_date ON contractors_waitlist(signup_date);

ALTER TABLE contractors_waitlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for service role" ON contractors_waitlist FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow anonymous read" ON contractors_waitlist FOR SELECT USING (true);
