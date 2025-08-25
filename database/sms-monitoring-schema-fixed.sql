
CREATE TABLE IF NOT EXISTS contractor_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contractor_id UUID REFERENCES contractors(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

CREATE TABLE IF NOT EXISTS sms_send_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contractor_id UUID REFERENCES contractors(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  phone_number VARCHAR(20) NOT NULL,
  message_content TEXT,
  category VARCHAR(100),
  sub_category VARCHAR(100),
  location VARCHAR(100),
  cost_cents INTEGER DEFAULT 79,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'sent',
  twilio_sid VARCHAR(100),
  delivery_status VARCHAR(50),
  error_message TEXT
);

CREATE TABLE IF NOT EXISTS sms_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  config_key VARCHAR(100) UNIQUE NOT NULL,
  config_value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by VARCHAR(100) DEFAULT 'admin'
);

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'contractors' AND column_name = 'is_sms_enabled') THEN
        ALTER TABLE contractors ADD COLUMN is_sms_enabled BOOLEAN DEFAULT TRUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'contractors' AND column_name = 'last_active') THEN
        ALTER TABLE contractors ADD COLUMN last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'contractors' AND column_name = 'sms_notifications_sent') THEN
        ALTER TABLE contractors ADD COLUMN sms_notifications_sent INTEGER DEFAULT 0;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_contractor_activity_log_contractor_id ON contractor_activity_log(contractor_id);
CREATE INDEX IF NOT EXISTS idx_contractor_activity_log_timestamp ON contractor_activity_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_sms_send_log_contractor_id ON sms_send_log(contractor_id);
CREATE INDEX IF NOT EXISTS idx_sms_send_log_timestamp ON sms_send_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_contractors_is_sms_enabled ON contractors(is_sms_enabled);
CREATE INDEX IF NOT EXISTS idx_contractors_last_active ON contractors(last_active);

ALTER TABLE contractor_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_send_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_config ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contractor_activity_log' AND policyname = 'Allow all for service role') THEN
        DROP POLICY "Allow all for service role" ON contractor_activity_log;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sms_send_log' AND policyname = 'Allow all for service role') THEN
        DROP POLICY "Allow all for service role" ON sms_send_log;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sms_config' AND policyname = 'Allow all for service role') THEN
        DROP POLICY "Allow all for service role" ON sms_config;
    END IF;
END $$;

CREATE POLICY "Allow all for service role" ON contractor_activity_log FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow all for service role" ON sms_send_log FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow all for service role" ON sms_config FOR ALL USING (auth.role() = 'service_role');

INSERT INTO sms_config (config_key, config_value, description) VALUES
('notification_limits', '{
  "default_max_contractors": 5,
  "category_overrides": {
    "Home Services": 7,
    "Legal": 3,
    "Real Estate": 4
  },
  "location_overrides": {
    "12345": 8,
    "90210": 6
  }
}', 'Maximum number of contractors to notify per lead'),

('eligibility_rules', '{
  "auto_disable_inactive": true,
  "inactivity_threshold_days": 14,
  "minimum_wallet_balance": 1.00,
  "send_reactivation_email": true
}', 'Contractor eligibility and auto-disable rules'),

('sms_budget', '{
  "monthly_limit_dollars": 500,
  "monthly_limit_messages": 63291,
  "auto_pause_on_limit": true,
  "admin_alert_threshold": 0.8
}', 'SMS budget caps and alerts'),

('delivery_rules', '{
  "email_first_enabled": false,
  "email_to_sms_delay_minutes": 10,
  "max_retries": 3,
  "cost_per_message_cents": 79
}', 'SMS delivery timing and retry rules')

ON CONFLICT (config_key) DO UPDATE SET
  config_value = EXCLUDED.config_value,
  updated_at = NOW();

UPDATE contractors 
SET last_active = NOW()
WHERE last_active IS NULL;
