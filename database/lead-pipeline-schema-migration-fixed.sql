

UPDATE leads SET status = 'available' WHERE status IN ('pending_review', 'valid');
UPDATE leads SET status = 'expired' WHERE status IN ('duplicate', 'invalid');
UPDATE leads SET status = 'purchased' WHERE status = 'claimed';

ALTER TABLE leads ADD COLUMN IF NOT EXISTS urgency VARCHAR(20) DEFAULT 'Standard' CHECK (urgency IN ('Standard', 'Premium', 'Emergency'));
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_type VARCHAR(20) DEFAULT 'standard' CHECK (lead_type IN ('standard', 'premium', 'emergency'));
ALTER TABLE leads ADD COLUMN IF NOT EXISTS price DECIMAL(10,2);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS contact_name VARCHAR(255);

ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_status_check;
ALTER TABLE leads ADD CONSTRAINT leads_status_check CHECK (status IN ('available', 'purchased', 'expired'));

CREATE TABLE IF NOT EXISTS lead_pricing (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category VARCHAR(100) NOT NULL,
  lead_type VARCHAR(20) NOT NULL CHECK (lead_type IN ('standard', 'premium', 'emergency')),
  price DECIMAL(10,2) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(category, lead_type)
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'contractor_leads_status_check' 
    AND check_clause LIKE '%contacted%'
  ) THEN
    ALTER TABLE contractor_leads DROP CONSTRAINT IF EXISTS contractor_leads_status_check;
    ALTER TABLE contractor_leads ADD CONSTRAINT contractor_leads_status_check CHECK (status IN ('available', 'purchased', 'expired'));
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS pricing_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_id VARCHAR(255),
  category VARCHAR(100) NOT NULL,
  lead_type VARCHAR(20) NOT NULL,
  old_price DECIMAL(10,2),
  new_price DECIMAL(10,2) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_urgency ON leads(urgency);
CREATE INDEX IF NOT EXISTS idx_leads_lead_type ON leads(lead_type);
CREATE INDEX IF NOT EXISTS idx_leads_price ON leads(price);
CREATE INDEX IF NOT EXISTS idx_lead_pricing_category_type ON lead_pricing(category, lead_type);
CREATE INDEX IF NOT EXISTS idx_pricing_history_category ON pricing_history(category);
CREATE INDEX IF NOT EXISTS idx_pricing_history_timestamp ON pricing_history(timestamp);

ALTER TABLE lead_pricing ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for service role" ON lead_pricing;
CREATE POLICY "Allow all for service role" ON lead_pricing FOR ALL USING (auth.role() = 'service_role');
DROP POLICY IF EXISTS "Allow anonymous read" ON lead_pricing;
CREATE POLICY "Allow anonymous read" ON lead_pricing FOR SELECT USING (true);

ALTER TABLE pricing_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for service role" ON pricing_history;
CREATE POLICY "Allow all for service role" ON pricing_history FOR ALL USING (auth.role() = 'service_role');
DROP POLICY IF EXISTS "Allow anonymous read" ON pricing_history;
CREATE POLICY "Allow anonymous read" ON pricing_history FOR SELECT USING (true);

INSERT INTO lead_pricing (category, lead_type, price) VALUES 
('HVAC', 'standard', 20.00),
('HVAC', 'premium', 35.00),
('HVAC', 'emergency', 100.00),
('Plumbing', 'standard', 25.00),
('Plumbing', 'premium', 40.00),
('Plumbing', 'emergency', 110.00),
('Electrical', 'standard', 30.00),
('Electrical', 'premium', 45.00),
('Electrical', 'emergency', 120.00),
('home_services', 'standard', 25.00),
('home_services', 'premium', 40.00),
('home_services', 'emergency', 100.00),
('insurance', 'standard', 30.00),
('insurance', 'premium', 45.00),
('insurance', 'emergency', 100.00),
('legal', 'standard', 50.00),
('legal', 'premium', 75.00),
('legal', 'emergency', 150.00),
('real_estate', 'standard', 35.00),
('real_estate', 'premium', 50.00),
('real_estate', 'emergency', 100.00),
('finance', 'standard', 42.00),
('finance', 'premium', 60.00),
('finance', 'emergency', 120.00),
('healthcare', 'standard', 45.00),
('healthcare', 'premium', 65.00),
('healthcare', 'emergency', 130.00),
('automotive', 'standard', 30.00),
('automotive', 'premium', 45.00),
('automotive', 'emergency', 100.00)
ON CONFLICT (category, lead_type) DO UPDATE SET 
  price = EXCLUDED.price,
  updated_at = NOW();

UPDATE leads 
SET price = (
  SELECT lp.price 
  FROM lead_pricing lp 
  WHERE lp.category = leads.service_category 
  AND lp.lead_type = 'standard'
)
WHERE price IS NULL;

COMMENT ON TABLE lead_pricing IS 'Pricing matrix for leads by category and urgency type (Standard/Premium/Emergency)';
COMMENT ON TABLE pricing_history IS 'Audit log for all pricing changes made by admins';
COMMENT ON COLUMN leads.urgency IS 'User-selected urgency level: Standard, Premium, or Emergency';
COMMENT ON COLUMN leads.lead_type IS 'System-mapped lead type: standard, premium, or emergency';
COMMENT ON COLUMN leads.price IS 'Calculated price based on category and lead_type from lead_pricing table';
