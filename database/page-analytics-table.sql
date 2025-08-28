CREATE TABLE IF NOT EXISTS page_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path VARCHAR(255) NOT NULL,
  view_count INTEGER DEFAULT 1,
  unique_visitors INTEGER DEFAULT 1,
  last_viewed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(page_path)
);

CREATE INDEX IF NOT EXISTS idx_page_analytics_path ON page_analytics(page_path);
CREATE INDEX IF NOT EXISTS idx_page_analytics_last_viewed ON page_analytics(last_viewed);

ALTER TABLE page_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for service role" ON page_analytics FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow anonymous read" ON page_analytics FOR SELECT USING (true);

INSERT INTO page_analytics (page_path, view_count, unique_visitors) 
VALUES ('/launch-soon', 0, 0) 
ON CONFLICT (page_path) DO NOTHING;

CREATE OR REPLACE FUNCTION increment_page_view(path TEXT)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO page_analytics (page_path, view_count, unique_visitors, last_viewed)
  VALUES (path, 1, 1, NOW())
  ON CONFLICT (page_path)
  DO UPDATE SET 
    view_count = page_analytics.view_count + 1,
    last_viewed = NOW();
END;
$$;
