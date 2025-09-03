
ALTER TABLE notification_logs DROP CONSTRAINT IF EXISTS notification_logs_lead_id_fkey;
ALTER TABLE notification_logs DROP CONSTRAINT IF EXISTS notification_logs_contractor_id_fkey;

ALTER TABLE notification_logs ALTER COLUMN lead_id TYPE UUID USING lead_id::text::uuid;
ALTER TABLE notification_logs ALTER COLUMN contractor_id TYPE UUID USING contractor_id::text::uuid;

ALTER TABLE notification_logs ADD CONSTRAINT notification_logs_lead_id_fkey 
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL;
ALTER TABLE notification_logs ADD CONSTRAINT notification_logs_contractor_id_fkey 
  FOREIGN KEY (contractor_id) REFERENCES contractors(id) ON DELETE SET NULL;

COMMENT ON TABLE notification_logs IS 'Fixed schema with UUID data types matching leads and contractors tables';
