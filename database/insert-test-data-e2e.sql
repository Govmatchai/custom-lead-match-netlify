
INSERT INTO contractors (
  id,
  business_name,
  contact_name,
  phone,
  email,
  username,
  password_hash,
  industry,
  sub_service,
  zip_codes,
  sms_opt_in,
  created_at
) VALUES (
  '9045dba2-e686-47c7-92d4-cc7a147855ce',
  'Test Construction LLC',
  'John Test Contractor',
  '(555) 123-4567',
  'john.test@example.com',
  'testcontractor456unique',
  '$2b$10$example.hash.for.testing.purposes.only',
  'home_services',
  'hvac',
  ARRAY['12345', '90210', '10001'],
  true,
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  business_name = EXCLUDED.business_name,
  contact_name = EXCLUDED.contact_name,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  username = EXCLUDED.username,
  industry = EXCLUDED.industry,
  sub_service = EXCLUDED.sub_service,
  zip_codes = EXCLUDED.zip_codes,
  sms_opt_in = EXCLUDED.sms_opt_in;

INSERT INTO transactions (
  contractor_id,
  amount,
  source,
  notes,
  created_at
) VALUES (
  '9045dba2-e686-47c7-92d4-cc7a147855ce',
  50.00,
  'test_deposit',
  'Test wallet funding for E2E testing',
  NOW()
) ON CONFLICT DO NOTHING;

INSERT INTO leads (
  id,
  customer_name,
  phone,
  email,
  service_category,
  sub_service,
  zip_code,
  description,
  status,
  claimed,
  is_archived,
  created_at
) VALUES 
(
  'test-lead-hvac-001',
  'Sarah Johnson',
  '(555) 987-6543',
  'sarah.johnson@email.com',
  'home_services',
  'hvac',
  '12345',
  'Need urgent AC repair - unit not cooling properly',
  'valid',
  false,
  false,
  NOW()
),
(
  'test-lead-hvac-002',
  'Mike Davis',
  '(555) 456-7890',
  'mike.davis@email.com',
  'home_services',
  'hvac',
  '90210',
  'Heating system installation for new home',
  'valid',
  false,
  false,
  NOW()
),
(
  'test-lead-hvac-003',
  'Lisa Chen',
  '(555) 321-9876',
  'lisa.chen@email.com',
  'home_services',
  'hvac',
  '10001',
  'HVAC maintenance and tune-up service needed',
  'valid',
  false,
  false,
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  customer_name = EXCLUDED.customer_name,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  service_category = EXCLUDED.service_category,
  sub_service = EXCLUDED.sub_service,
  zip_code = EXCLUDED.zip_code,
  description = EXCLUDED.description,
  status = EXCLUDED.status,
  claimed = EXCLUDED.claimed,
  is_archived = EXCLUDED.is_archived;

INSERT INTO purchased_leads (
  id,
  contractor_id,
  lead_id,
  price_paid,
  zip_code,
  purchased_at,
  status
) VALUES (
  'test-purchase-e2e-001',
  '15f0808d-9c87-41a1-8a7e-a5e01e329cb1',
  'test-lead-e2e-001',
  25.00,
  '12345',
  NOW(),
  'active'
) ON CONFLICT (id) DO UPDATE SET
  contractor_id = EXCLUDED.contractor_id,
  lead_id = EXCLUDED.lead_id,
  price_paid = EXCLUDED.price_paid,
  zip_code = EXCLUDED.zip_code,
  purchased_at = EXCLUDED.purchased_at,
  status = EXCLUDED.status;
