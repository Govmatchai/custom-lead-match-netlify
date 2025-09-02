ALTER TABLE contractor_leads ADD COLUMN IF NOT EXISTS price_paid DECIMAL(10,2);

UPDATE contractor_leads 
SET price_paid = CASE 
  WHEN leads.service_category = 'HVAC' THEN 20.00
  WHEN leads.service_category = 'Plumbing' THEN 25.00
  WHEN leads.service_category = 'Electrical' THEN 30.00
  ELSE 20.00
END
FROM leads 
WHERE contractor_leads.lead_id = leads.id 
  AND contractor_leads.status = 'purchased' 
  AND contractor_leads.price_paid IS NULL;
