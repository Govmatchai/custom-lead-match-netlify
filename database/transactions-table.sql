CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    contractor_id UUID REFERENCES contractors(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    source VARCHAR(100) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_contractor_id ON transactions(contractor_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_source ON transactions(source);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for service role" ON transactions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow anonymous read" ON transactions FOR SELECT USING (true);
