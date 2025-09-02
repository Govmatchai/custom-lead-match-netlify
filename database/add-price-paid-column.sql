ALTER TABLE contractor_leads ADD COLUMN IF NOT EXISTS price_paid DECIMAL(10,2);

CREATE INDEX IF NOT EXISTS idx_contractor_leads_price_paid ON contractor_leads(price_paid);
