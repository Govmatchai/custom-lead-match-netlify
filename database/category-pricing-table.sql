CREATE TABLE IF NOT EXISTS category_pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category VARCHAR(100) UNIQUE NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_category_pricing_category ON category_pricing(category);

ALTER TABLE category_pricing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for service role" ON category_pricing FOR ALL USING (auth.role() = 'service_role');

INSERT INTO category_pricing (category, price) VALUES 
('home_services', 25.00),
('legal', 50.00),
('real_estate', 35.00),
('finance', 40.00),
('insurance', 30.00),
('healthcare', 45.00),
('automotive', 20.00)
ON CONFLICT (category) DO NOTHING;
