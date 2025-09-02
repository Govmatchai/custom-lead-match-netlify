
INSERT INTO contractors (
    id,
    email,
    username,
    password_hash,
    business_name,
    company_name,
    phone,
    service_category,
    industry,
    sub_service,
    zip_codes,
    service_zips,
    wallet_balance,
    created_at,
    updated_at,
    active,
    is_sms_enabled,
    sms_opt_in
) VALUES 
(
    gen_random_uuid(),
    'freshhvac15@example.com',
    'freshhvac15',
    '$2b$10$abcdefghijklmnopqrstuvwxyz123456789',
    'Fresh HVAC Co',
    'Fresh HVAC Co',
    '555-123-1515',
    'Home Services',
    'home_services',
    'hvac',
    ARRAY['98765'],
    ARRAY['98765'],
    50.00,
    NOW(),
    NOW(),
    true,
    true,
    true
),
(
    gen_random_uuid(),
    'govhvac01@example.com',
    'govhvac01',
    '$2b$10$abcdefghijklmnopqrstuvwxyz123456789',
    'Gov HVAC LLC',
    'Gov HVAC LLC',
    '555-123-0101',
    'Home Services',
    'home_services',
    'hvac',
    ARRAY['98765'],
    ARRAY['98765'],
    50.00,
    NOW(),
    NOW(),
    true,
    true,
    true
);

SELECT 
    id,
    email,
    username,
    business_name,
    service_category,
    zip_codes,
    wallet_balance,
    active
FROM contractors 
WHERE username IN ('freshhvac15', 'govhvac01');
