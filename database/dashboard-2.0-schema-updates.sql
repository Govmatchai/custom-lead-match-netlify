
ALTER TABLE contractor_leads ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE contractor_leads ADD COLUMN IF NOT EXISTS contacted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE contractor_leads ADD COLUMN IF NOT EXISTS booked_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE contractor_leads ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE contractor_leads ADD COLUMN IF NOT EXISTS job_value DECIMAL(10,2);
ALTER TABLE contractor_leads ADD COLUMN IF NOT EXISTS refund_requested BOOLEAN DEFAULT false;
ALTER TABLE contractor_leads ADD COLUMN IF NOT EXISTS refund_reason TEXT;
ALTER TABLE contractor_leads ADD COLUMN IF NOT EXISTS response_time_minutes INTEGER;

ALTER TABLE contractor_leads DROP CONSTRAINT IF EXISTS contractor_leads_status_check;
ALTER TABLE contractor_leads ADD CONSTRAINT contractor_leads_status_check 
  CHECK (status IN ('available', 'purchased', 'expired', 'contacted', 'booked', 'completed', 'did_not_close', 'archived'));

CREATE INDEX IF NOT EXISTS idx_contractor_leads_status_updated_at ON contractor_leads(status_updated_at);
CREATE INDEX IF NOT EXISTS idx_contractor_leads_job_value ON contractor_leads(job_value);
CREATE INDEX IF NOT EXISTS idx_contractor_leads_refund_requested ON contractor_leads(refund_requested);
CREATE INDEX IF NOT EXISTS idx_contractor_leads_response_time ON contractor_leads(response_time_minutes);

ALTER TABLE contractors ADD COLUMN IF NOT EXISTS auto_reload_enabled BOOLEAN DEFAULT false;
ALTER TABLE contractors ADD COLUMN IF NOT EXISTS auto_reload_threshold DECIMAL(10,2) DEFAULT 20.00;
ALTER TABLE contractors ADD COLUMN IF NOT EXISTS auto_reload_amount DECIMAL(10,2) DEFAULT 100.00;

ALTER TABLE contractors ADD COLUMN IF NOT EXISTS response_time_score INTEGER DEFAULT 0;
ALTER TABLE contractors ADD COLUMN IF NOT EXISTS top_performer_badge BOOLEAN DEFAULT false;
ALTER TABLE contractors ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;
ALTER TABLE contractors ADD COLUMN IF NOT EXISTS best_streak INTEGER DEFAULT 0;
ALTER TABLE contractors ADD COLUMN IF NOT EXISTS total_roi DECIMAL(10,2) DEFAULT 0.00;

CREATE TABLE IF NOT EXISTS contractor_performance_metrics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    contractor_id UUID REFERENCES contractors(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    leads_purchased INTEGER DEFAULT 0,
    leads_contacted INTEGER DEFAULT 0,
    leads_booked INTEGER DEFAULT 0,
    leads_completed INTEGER DEFAULT 0,
    total_spend DECIMAL(10,2) DEFAULT 0.00,
    total_revenue DECIMAL(10,2) DEFAULT 0.00,
    avg_response_time_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(contractor_id, date)
);

CREATE INDEX IF NOT EXISTS idx_contractor_performance_metrics_contractor_id ON contractor_performance_metrics(contractor_id);
CREATE INDEX IF NOT EXISTS idx_contractor_performance_metrics_date ON contractor_performance_metrics(date);

CREATE TABLE IF NOT EXISTS refund_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    contractor_id UUID REFERENCES contractors(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    contractor_lead_id UUID REFERENCES contractor_leads(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    processed_by VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_refund_requests_contractor_id ON refund_requests(contractor_id);
CREATE INDEX IF NOT EXISTS idx_refund_requests_status ON refund_requests(status);
CREATE INDEX IF NOT EXISTS idx_refund_requests_requested_at ON refund_requests(requested_at);

ALTER TABLE contractor_performance_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for service role" ON contractor_performance_metrics FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow anonymous read" ON contractor_performance_metrics FOR SELECT USING (true);

ALTER TABLE refund_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for service role" ON refund_requests FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow anonymous read" ON refund_requests FOR SELECT USING (true);

COMMENT ON TABLE contractor_performance_metrics IS 'Daily performance metrics for contractors to track ROI and KPIs';
COMMENT ON TABLE refund_requests IS 'Refund requests from contractors for invalid leads, managed by admin';
COMMENT ON COLUMN contractor_leads.job_value IS 'Value of completed job in USD for ROI calculation';
COMMENT ON COLUMN contractor_leads.response_time_minutes IS 'Minutes between lead purchase and first contact attempt';
