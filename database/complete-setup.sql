
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
CREATE INDEX idx_leads_service_category ON leads(service_category);
CREATE INDEX idx_leads_zip_code ON leads(zip_code);
CREATE INDEX idx_leads_claimed ON leads(claimed);
CREATE INDEX idx_leads_created_at ON leads(created_at);
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

INSERT INTO contractors (business_name, contact_name, email, phone, industry, sub_service, zip_codes, sms_opt_in, lead_credits) VALUES
('ABC Plumbing', 'John Smith', 'john@abcplumbing.com', '555-0101', 'Home Services', 'Plumbing', ARRAY['12345', '12346'], true, 5),
('Smith Legal', 'Jane Smith', 'jane@smithlegal.com', '555-0102', 'Legal', 'Personal Injury', ARRAY['12345', '12347'], true, 3),
('Quick HVAC', 'Bob Johnson', 'bob@quickhvac.com', '555-0103', 'Home Services', 'HVAC', ARRAY['12346', '12348'], true, 8);

INSERT INTO leads (customer_name, service_category, sub_service, zip_code, phone, description) VALUES
('Alice Brown', 'Home Services', 'Plumbing', '12345', '555-0201', 'Kitchen sink is leaking and needs immediate repair'),
('Mike Davis', 'Legal', 'Personal Injury', '12345', '555-0202', 'Car accident case, need legal representation'),
('Sarah Wilson', 'Home Services', 'HVAC', '12346', '555-0203', 'Air conditioning not working, need repair ASAP');
