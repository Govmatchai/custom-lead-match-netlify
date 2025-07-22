
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE contractors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    industry VARCHAR(100) NOT NULL,
    sub_service VARCHAR(100) NOT NULL,
    zip_codes TEXT[] NOT NULL,
    sms_opt_in BOOLEAN DEFAULT true,
    lead_credits INTEGER DEFAULT 3,
    stripe_customer_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE leads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    service_category VARCHAR(100) NOT NULL,
    sub_service VARCHAR(100) NOT NULL,
    zip_code VARCHAR(10) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    description TEXT NOT NULL,
    claimed BOOLEAN DEFAULT false,
    claimed_by UUID REFERENCES contractors(id),
    claimed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE claim_tokens (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    token VARCHAR(255) UNIQUE NOT NULL,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_contractors_industry ON contractors(industry);
CREATE INDEX idx_contractors_zip_codes ON contractors USING GIN(zip_codes);
CREATE INDEX idx_contractors_credits ON contractors(lead_credits);
CREATE INDEX idx_leads_service_category ON leads(service_category);
CREATE INDEX idx_leads_zip_code ON leads(zip_code);
CREATE INDEX idx_leads_claimed ON leads(claimed);
CREATE INDEX idx_leads_created_at ON leads(created_at);
CREATE INDEX idx_claim_tokens_token ON claim_tokens(token);
CREATE INDEX idx_claim_tokens_expires_at ON claim_tokens(expires_at);

ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for service role" ON contractors FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow all for service role" ON leads FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow all for service role" ON claim_tokens FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow anonymous read" ON contractors FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read" ON leads FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read" ON claim_tokens FOR SELECT USING (true);
