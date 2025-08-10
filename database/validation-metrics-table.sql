CREATE TABLE IF NOT EXISTS validation_metrics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL,
    service_category VARCHAR(100),
    zip_code VARCHAR(10),
    validation_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    phone_valid BOOLEAN NOT NULL,
    email_format_valid BOOLEAN NOT NULL,
    email_deliverable BOOLEAN NOT NULL,
    is_duplicate BOOLEAN NOT NULL,
    content_invalid BOOLEAN NOT NULL,
    ip_rate_limited BOOLEAN NOT NULL,
    client_ip INET,
    email_domain VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_validation_metrics_timestamp ON validation_metrics(validation_timestamp);
CREATE INDEX IF NOT EXISTS idx_validation_metrics_status ON validation_metrics(status);
CREATE INDEX IF NOT EXISTS idx_validation_metrics_service_category ON validation_metrics(service_category);
CREATE INDEX IF NOT EXISTS idx_validation_metrics_lead_id ON validation_metrics(lead_id);

ALTER TABLE validation_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for service role" ON validation_metrics FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow anonymous read" ON validation_metrics FOR SELECT USING (true);
