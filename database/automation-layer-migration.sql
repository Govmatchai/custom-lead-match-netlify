ALTER TABLE leads ADD COLUMN IF NOT EXISTS validation_email_status VARCHAR(20) DEFAULT 'pending' CHECK (validation_email_status IN ('pending', 'valid', 'invalid', 'error', 'skipped', 'unknown'));
ALTER TABLE leads ADD COLUMN IF NOT EXISTS validation_phone_status VARCHAR(20) DEFAULT 'pending' CHECK (validation_phone_status IN ('pending', 'valid', 'invalid', 'error', 'skipped', 'unknown'));
ALTER TABLE leads ADD COLUMN IF NOT EXISTS validation_zip_status VARCHAR(20) DEFAULT 'pending' CHECK (validation_zip_status IN ('pending', 'valid', 'invalid', 'error', 'skipped', 'unknown'));

CREATE TABLE IF NOT EXISTS refund_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  contractor_id UUID REFERENCES contractors(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS weekly_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  contractor_id UUID REFERENCES contractors(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  leads_purchased INTEGER DEFAULT 0,
  spend DECIMAL(10,2) DEFAULT 0.00,
  refunds DECIMAL(10,2) DEFAULT 0.00,
  wallet_balance DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(contractor_id, week_start)
);

CREATE INDEX IF NOT EXISTS idx_leads_validation_email_status ON leads(validation_email_status);
CREATE INDEX IF NOT EXISTS idx_leads_validation_phone_status ON leads(validation_phone_status);
CREATE INDEX IF NOT EXISTS idx_leads_validation_zip_status ON leads(validation_zip_status);
CREATE INDEX IF NOT EXISTS idx_refund_requests_contractor_id ON refund_requests(contractor_id);
CREATE INDEX IF NOT EXISTS idx_refund_requests_status ON refund_requests(status);
CREATE INDEX IF NOT EXISTS idx_refund_requests_requested_at ON refund_requests(requested_at);
CREATE INDEX IF NOT EXISTS idx_weekly_reports_contractor_id ON weekly_reports(contractor_id);
CREATE INDEX IF NOT EXISTS idx_weekly_reports_week_start ON weekly_reports(week_start);

ALTER TABLE refund_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for service role" ON refund_requests FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow anonymous read" ON refund_requests FOR SELECT USING (true);

ALTER TABLE weekly_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for service role" ON weekly_reports FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow anonymous read" ON weekly_reports FOR SELECT USING (true);

COMMENT ON TABLE refund_requests IS 'Contractor refund requests for purchased leads with admin approval workflow';
COMMENT ON TABLE weekly_reports IS 'Weekly performance reports for contractors including spend, refunds, and wallet balance';
COMMENT ON COLUMN leads.validation_email_status IS 'Email validation status from NeverBounce API';
COMMENT ON COLUMN leads.validation_phone_status IS 'Phone validation status from Twilio Lookup API';
COMMENT ON COLUMN leads.validation_zip_status IS 'ZIP code validation status from USPS API';
