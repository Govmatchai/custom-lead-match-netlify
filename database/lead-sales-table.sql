CREATE TABLE IF NOT EXISTS lead_sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  purchased_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lead_sales_contractor_id ON lead_sales(contractor_id);
CREATE INDEX IF NOT EXISTS idx_lead_sales_lead_id ON lead_sales(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_sales_purchased_at ON lead_sales(purchased_at);

ALTER TABLE lead_sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for service role" ON lead_sales FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow anonymous read" ON lead_sales FOR SELECT USING (true);
