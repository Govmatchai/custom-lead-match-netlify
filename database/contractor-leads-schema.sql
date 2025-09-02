
CREATE TABLE IF NOT EXISTS contractor_leads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    contractor_id UUID REFERENCES contractors(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'purchased', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    purchased_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(contractor_id, lead_id)
);

CREATE INDEX IF NOT EXISTS idx_contractor_leads_contractor_id ON contractor_leads(contractor_id);
CREATE INDEX IF NOT EXISTS idx_contractor_leads_lead_id ON contractor_leads(lead_id);
CREATE INDEX IF NOT EXISTS idx_contractor_leads_status ON contractor_leads(status);
CREATE INDEX IF NOT EXISTS idx_contractor_leads_created_at ON contractor_leads(created_at);
CREATE INDEX IF NOT EXISTS idx_contractor_leads_purchased_at ON contractor_leads(purchased_at);

ALTER TABLE contractor_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for service role" ON contractor_leads FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow anonymous read" ON contractor_leads FOR SELECT USING (true);

ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_status_check;
ALTER TABLE leads ADD CONSTRAINT leads_status_check CHECK (status IN ('pending_review', 'valid', 'duplicate', 'invalid', 'claimed', 'purchased', 'available', 'expired'));

ALTER TABLE leads ADD COLUMN IF NOT EXISTS distributed BOOLEAN DEFAULT false;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS distributed_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE contractors ADD COLUMN IF NOT EXISTS company_name VARCHAR(255);
ALTER TABLE contractors ADD COLUMN IF NOT EXISTS service_zips TEXT[];

UPDATE contractors SET company_name = business_name WHERE company_name IS NULL;
UPDATE contractors SET service_zips = zip_codes WHERE service_zips IS NULL;

CREATE INDEX IF NOT EXISTS idx_contractors_service_zips ON contractors USING GIN(service_zips);
CREATE INDEX IF NOT EXISTS idx_leads_distributed ON leads(distributed);
CREATE INDEX IF NOT EXISTS idx_leads_distributed_at ON leads(distributed_at);

COMMENT ON TABLE contractor_leads IS 'Join table allowing multiple contractors to see the same lead, but only one can purchase it';
COMMENT ON COLUMN contractor_leads.status IS 'available: contractor can purchase, purchased: contractor bought this lead, expired: another contractor bought it';
