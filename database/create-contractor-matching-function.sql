
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS contractor_notifications (
    notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    UNIQUE(lead_id, contractor_id)
);

CREATE INDEX IF NOT EXISTS idx_contractor_notifications_lead_id ON contractor_notifications(lead_id);
CREATE INDEX IF NOT EXISTS idx_contractor_notifications_contractor_id ON contractor_notifications(contractor_id);
CREATE INDEX IF NOT EXISTS idx_contractor_notifications_status ON contractor_notifications(status);
CREATE INDEX IF NOT EXISTS idx_contractor_notifications_created_at ON contractor_notifications(created_at);

ALTER TABLE contractor_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for service role" ON contractor_notifications;
CREATE POLICY "Allow all for service role" ON contractor_notifications FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Allow anonymous read" ON contractor_notifications;
CREATE POLICY "Allow anonymous read" ON contractor_notifications FOR SELECT USING (true);

CREATE OR REPLACE FUNCTION match_contractors_for_lead(lead_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    lead_record RECORD;
    contractor_record RECORD;
    notification_count INTEGER := 0;
BEGIN
    SELECT * INTO lead_record FROM leads WHERE id = lead_id;
    
    IF NOT FOUND THEN
        RAISE WARNING 'Lead with ID % not found', lead_id;
        RETURN;
    END IF;
    
    RAISE NOTICE 'Starting contractor matching for lead % (service: %/%)', 
        lead_id, lead_record.service_category, lead_record.sub_service;
    
    FOR contractor_record IN
        SELECT c.*
        FROM contractors c
        WHERE 
            c.industry = lead_record.service_category
            AND c.sub_service = lead_record.sub_service
            AND c.lead_credits > 0
            AND c.sms_opt_in = true
            AND (
                c.zip_codes IS NULL 
                OR array_length(c.zip_codes, 1) IS NULL 
                OR lead_record.zip_code = ANY(c.zip_codes)
            )
        ORDER BY c.created_at ASC -- First come, first served
    LOOP
        BEGIN
            INSERT INTO contractor_notifications (
                lead_id,
                contractor_id,
                status,
                created_at
            ) VALUES (
                lead_id,
                contractor_record.id,
                'pending',
                NOW()
            );
            
            notification_count := notification_count + 1;
            
            RAISE NOTICE 'Created notification for contractor % (business: %)', 
                contractor_record.id, contractor_record.business_name;
                
        EXCEPTION 
            WHEN unique_violation THEN
                RAISE NOTICE 'Notification already exists for contractor % and lead %', 
                    contractor_record.id, lead_id;
        END;
    END LOOP;
    
    RAISE NOTICE 'Contractor matching completed for lead %. Created % notifications.', 
        lead_id, notification_count;
        
    RETURN;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in match_contractors_for_lead for lead %: %', lead_id, SQLERRM;
        RETURN;
END;
$$;

GRANT EXECUTE ON FUNCTION match_contractors_for_lead(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION match_contractors_for_lead(uuid) TO anon;

CREATE OR REPLACE FUNCTION trigger_match_contractors_for_lead()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NEW.status = 'valid' THEN
        PERFORM match_contractors_for_lead(NEW.id);
    END IF;
    
    RETURN NEW;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Trigger error for lead %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS after_lead_insert_trigger ON leads;
CREATE TRIGGER after_lead_insert_trigger
    AFTER INSERT ON leads
    FOR EACH ROW
    EXECUTE FUNCTION trigger_match_contractors_for_lead();

GRANT EXECUTE ON FUNCTION trigger_match_contractors_for_lead() TO service_role;
GRANT EXECUTE ON FUNCTION trigger_match_contractors_for_lead() TO anon;
