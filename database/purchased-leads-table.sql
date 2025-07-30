CREATE TABLE IF NOT EXISTS purchased_leads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    contractor_id UUID REFERENCES contractors(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    price_paid NUMERIC(10,2) NOT NULL,
    zip_code VARCHAR(10) NOT NULL,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_purchased_leads_contractor_id ON purchased_leads(contractor_id);
CREATE INDEX IF NOT EXISTS idx_purchased_leads_lead_id ON purchased_leads(lead_id);
CREATE INDEX IF NOT EXISTS idx_purchased_leads_purchased_at ON purchased_leads(purchased_at);

ALTER TABLE purchased_leads ADD CONSTRAINT unique_contractor_lead UNIQUE (contractor_id, lead_id);

ALTER TABLE purchased_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for service role" ON purchased_leads FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow anonymous read" ON purchased_leads FOR SELECT USING (true);

ALTER TABLE leads ADD COLUMN IF NOT EXISTS purchased_by UUID REFERENCES contractors(id);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS purchased_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_status_check;
ALTER TABLE leads ADD CONSTRAINT leads_status_check CHECK (status IN ('pending_review', 'valid', 'duplicate', 'invalid', 'claimed', 'purchased'));
