

CREATE OR REPLACE FUNCTION trigger_match_contractors_for_lead()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM
    net.http_post(
      url := 'https://nkubtsnpkdghfnukduuv.supabase.co/functions/v1/match-contractors-for-lead',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb,
      body := jsonb_build_object('record', to_jsonb(NEW))
    );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Edge function call failed: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS after_lead_insert_trigger ON leads;
CREATE TRIGGER after_lead_insert_trigger
  AFTER INSERT ON leads
  FOR EACH ROW
  EXECUTE FUNCTION trigger_match_contractors_for_lead();
