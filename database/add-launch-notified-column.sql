ALTER TABLE contractors_waitlist 
ADD COLUMN IF NOT EXISTS launch_notified BOOLEAN DEFAULT false;

UPDATE contractors_waitlist 
SET launch_notified = false 
WHERE launch_notified IS NULL;
