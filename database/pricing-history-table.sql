CREATE TABLE IF NOT EXISTS pricing_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_id VARCHAR(255),
  category VARCHAR(100) NOT NULL,
  lead_type VARCHAR(50) DEFAULT 'standard',
  old_price DECIMAL(10,2),
  new_price DECIMAL(10,2) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_pricing_history_category ON pricing_history(category);
CREATE INDEX IF NOT EXISTS idx_pricing_history_timestamp ON pricing_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_pricing_history_admin_id ON pricing_history(admin_id);

ALTER TABLE pricing_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for service role" ON pricing_history FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow anonymous read" ON pricing_history FOR SELECT USING (true);

INSERT INTO category_pricing (category, price) VALUES 
('HVAC', 20.00),
('Plumbing', 25.00),
('Electrical', 30.00),
('Roofing', 35.00),
('Emergency', 100.00)
ON CONFLICT (category) DO UPDATE SET 
  price = EXCLUDED.price,
  updated_at = NOW();

COMMENT ON TABLE pricing_history IS 'Audit log for all lead pricing changes made by admins';
COMMENT ON COLUMN pricing_history.admin_id IS 'ID of admin who made the pricing change';
COMMENT ON COLUMN pricing_history.old_price IS 'Previous price before the change';
COMMENT ON COLUMN pricing_history.new_price IS 'New price after the change';
