ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS distributed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS distributed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_leads_distribution 
ON public.leads (status, distributed, lead_score, created_at);

CREATE INDEX IF NOT EXISTS idx_leads_score_timing
ON public.leads (lead_score, created_at, distributed) 
WHERE status = 'valid';
