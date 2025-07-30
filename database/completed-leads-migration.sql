ALTER TABLE purchased_leads ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed'));

CREATE INDEX IF NOT EXISTS idx_purchased_leads_status ON purchased_leads(status);

UPDATE purchased_leads SET status = 'active' WHERE status IS NULL;
