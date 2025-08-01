
INSERT INTO contractors (
  id,
  business_name,
  contact_name,
  email,
  phone,
  industry,
  sub_service,
  zip_codes,
  username,
  password_hash,
  sms_opt_in,
  wallet_balance,
  created_at,
  updated_at
) VALUES (
  'test-contractor-e2e-001',
  'Test Construction LLC',
  'Test Contractor',
  'testcontractor@example.com',
  '(555) 123-4567',
  'home_services',
  'plumbing',
  ARRAY['12345', '67890'],
  'testcontractor@example.com',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- bcrypt hash for 'Test123!'
  true,
  100.00,
  NOW(),
  NOW()
) ON CONFLICT (username) DO UPDATE SET
  business_name = EXCLUDED.business_name,
  contact_name = EXCLUDED.contact_name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  industry = EXCLUDED.industry,
  sub_service = EXCLUDED.sub_service,
  zip_codes = EXCLUDED.zip_codes,
  password_hash = EXCLUDED.password_hash,
  sms_opt_in = EXCLUDED.sms_opt_in,
  wallet_balance = EXCLUDED.wallet_balance,
  updated_at = NOW();

INSERT INTO leads (
  id,
  customer_name,
  service_category,
  sub_service,
  zip_code,
  description,
  status,
  price,
  created_at
) VALUES 
(
  'test-lead-001',
  'John Smith',
  'home_services',
  'plumbing',
  '12345',
  'Kitchen sink is leaking and needs immediate repair. Water is pooling under the cabinet.',
  'available',
  25.00,
  NOW()
),
(
  'test-lead-002', 
  'Jane Doe',
  'home_services',
  'plumbing',
  '67890',
  'Bathroom toilet is running constantly. Need plumber to fix the issue.',
  'available',
  30.00,
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  customer_name = EXCLUDED.customer_name,
  service_category = EXCLUDED.service_category,
  sub_service = EXCLUDED.sub_service,
  zip_code = EXCLUDED.zip_code,
  description = EXCLUDED.description,
  status = EXCLUDED.status,
  price = EXCLUDED.price;

INSERT INTO purchased_leads (
  id,
  contractor_id,
  lead_id,
  price_paid,
  zip_code,
  purchased_at,
  status
) VALUES (
  'test-purchase-001',
  'test-contractor-e2e-001',
  'test-lead-001',
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
