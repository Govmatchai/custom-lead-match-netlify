ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_score SMALLINT NOT NULL DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_score_band TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_score_reason TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_score_updated_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(lead_score);

CREATE TABLE IF NOT EXISTS lead_score_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  score SMALLINT NOT NULL,
  band TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lead_score_events_lead_id ON lead_score_events(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_score_events_created_at ON lead_score_events(created_at);

ALTER TABLE lead_score_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for service role" ON lead_score_events FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow anonymous read" ON lead_score_events FOR SELECT USING (true);

UPDATE leads SET 
  lead_score_band = CASE 
    WHEN lead_score >= 80 THEN 'A'
    WHEN lead_score >= 60 THEN 'B'
    ELSE 'C'
  END
WHERE lead_score_band IS NULL;
