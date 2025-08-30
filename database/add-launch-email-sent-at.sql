ALTER TABLE contractors_waitlist 
ADD COLUMN IF NOT EXISTS launch_email_sent_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_contractors_waitlist_launch_email_sent_at 
ON contractors_waitlist(launch_email_sent_at);

UPDATE contractors_waitlist 
SET launch_email_sent_at = created_at 
WHERE launch_notified = true AND launch_email_sent_at IS NULL;
