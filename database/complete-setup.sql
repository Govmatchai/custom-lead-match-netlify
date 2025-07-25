
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS contractors CASCADE;

CREATE TABLE contractors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
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
    email VARCHAR(255),
    description TEXT NOT NULL,
    ip_address INET,
    status VARCHAR(50) DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'valid', 'duplicate', 'invalid', 'claimed')),
    validation_flags JSONB DEFAULT '{}',
    claimed BOOLEAN DEFAULT false,
    claimed_by UUID REFERENCES contractors(id),
    claimed_at TIMESTAMP WITH TIME ZONE,
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE claim_tokens (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    token VARCHAR(255) UNIQUE NOT NULL,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE industries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    sub_services TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO industries (name, sub_services) VALUES
('Legal', ARRAY['Personal Injury', 'Criminal Defense', 'Family Law', 'Business Law', 'Real Estate Law', 'Immigration', 'Bankruptcy']),
('Home Services', ARRAY['HVAC', 'Plumbing', 'Electrical', 'Roofing', 'Flooring', 'Painting', 'Landscaping', 'Pest Control', 'Cleaning Services']),
('Real Estate', ARRAY['Residential Sales', 'Commercial Sales', 'Property Management', 'Real Estate Investment', 'Mortgage Lending']),
('Finance', ARRAY['Financial Planning', 'Investment Management', 'Tax Services', 'Accounting', 'Business Loans', 'Personal Loans']),
('Insurance', ARRAY['Auto Insurance', 'Home Insurance', 'Life Insurance', 'Health Insurance', 'Business Insurance', 'Disability Insurance']),
('Healthcare', ARRAY['Primary Care', 'Dental', 'Mental Health', 'Physical Therapy', 'Chiropractic', 'Dermatology', 'Cardiology']),
('Auto', ARRAY['Auto Repair', 'Auto Sales', 'Auto Insurance', 'Towing Services', 'Auto Detailing', 'Tire Services']);

CREATE INDEX idx_contractors_industry ON contractors(industry);
CREATE INDEX idx_contractors_zip_codes ON contractors USING GIN(zip_codes);
CREATE INDEX idx_contractors_credits ON contractors(lead_credits);
CREATE INDEX idx_contractors_username ON contractors(username);
CREATE INDEX idx_leads_service_category ON leads(service_category);
CREATE INDEX idx_leads_zip_code ON leads(zip_code);
CREATE INDEX idx_leads_claimed ON leads(claimed);
CREATE INDEX idx_leads_created_at ON leads(created_at);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_ip_address ON leads(ip_address);
CREATE INDEX idx_leads_is_archived ON leads(is_archived);
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_claim_tokens_token ON claim_tokens(token);
CREATE INDEX idx_claim_tokens_expires_at ON claim_tokens(expires_at);
CREATE INDEX idx_industries_name ON industries(name);

ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE industries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for service role" ON contractors FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow all for service role" ON leads FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow all for service role" ON claim_tokens FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow all for service role" ON industries FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow anonymous read" ON contractors FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read" ON leads FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read" ON claim_tokens FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read" ON industries FOR SELECT USING (true);

INSERT INTO contractors (business_name, contact_name, email, phone, username, password_hash, industry, sub_service, zip_codes, sms_opt_in, lead_credits) VALUES
('ABC Plumbing', 'John Smith', 'john@abcplumbing.com', '555-0101', 'johnsmith', '$2b$12$defaulthash', 'Home Services', 'Plumbing', ARRAY['12345', '12346'], true, 5),
('Smith Legal', 'Jane Smith', 'jane@smithlegal.com', '555-0102', 'janesmith', '$2b$12$defaulthash', 'Legal', 'Personal Injury', ARRAY['12345', '12347'], true, 3),
('Quick HVAC', 'Bob Johnson', 'bob@quickhvac.com', '555-0103', 'bobjohnson', '$2b$12$defaulthash', 'Home Services', 'HVAC', ARRAY['12346', '12348'], true, 8);

CREATE TABLE dynamic_pages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    industry VARCHAR(100) NOT NULL,
    sub_industry VARCHAR(100) NOT NULL,
    contractor_id UUID REFERENCES contractors(id),
    template_data JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_dynamic_pages_slug ON dynamic_pages(slug);
CREATE INDEX idx_dynamic_pages_industry ON dynamic_pages(industry);
CREATE INDEX idx_dynamic_pages_contractor_id ON dynamic_pages(contractor_id);

CREATE TABLE IF NOT EXISTS contractor_login_tokens (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  contractor_id UUID REFERENCES contractors(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_contractor_login_tokens_token ON contractor_login_tokens(token);
CREATE INDEX idx_contractor_login_tokens_expires_at ON contractor_login_tokens(expires_at);

ALTER TABLE contractor_login_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for service role" ON contractor_login_tokens FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow anonymous read" ON contractor_login_tokens FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS contractor_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  contractor_id UUID REFERENCES contractors(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_contractor_sessions_token ON contractor_sessions(session_token);
CREATE INDEX idx_contractor_sessions_expires_at ON contractor_sessions(expires_at);

ALTER TABLE contractor_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for service role" ON contractor_sessions FOR ALL USING (auth.role() = 'service_role');

INSERT INTO leads (customer_name, service_category, sub_service, zip_code, phone, email, description, status) VALUES
('Alice Brown', 'Home Services', 'Plumbing', '12345', '555-0201', 'alice@example.com', 'Kitchen sink is leaking and needs immediate repair', 'valid'),
('Mike Davis', 'Legal', 'Personal Injury', '12345', '555-0202', 'mike@example.com', 'Car accident case, need legal representation', 'valid'),
('Sarah Wilson', 'Home Services', 'HVAC', '12346', '555-0203', 'sarah@example.com', 'Air conditioning not working, need repair ASAP', 'valid');
