
CREATE TABLE IF NOT EXISTS notification_logs (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  level VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  context JSONB DEFAULT '{}',
  function_name VARCHAR(100),
  lead_id INTEGER,
  contractor_id INTEGER,
  email VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_logs_timestamp ON notification_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_notification_logs_level ON notification_logs(level);
CREATE INDEX IF NOT EXISTS idx_notification_logs_function ON notification_logs(function_name);
CREATE INDEX IF NOT EXISTS idx_notification_logs_lead_id ON notification_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_contractor_id ON notification_logs(contractor_id);

ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage notification logs" ON notification_logs;
CREATE POLICY "Service role can manage notification logs" ON notification_logs
  FOR ALL USING (true);

GRANT ALL ON notification_logs TO service_role;
GRANT USAGE, SELECT ON SEQUENCE notification_logs_id_seq TO service_role;
