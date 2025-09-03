SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND ccu.table_name = 'leads'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name;

SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN (
        'lead_sales',
        'refund_requests', 
        'contractor_leads',
        'transactions',
        'purchased_leads',
        'validation_metrics',
        'notification_logs',
        'sms_send_log',
        'claim_tokens',
        'lead_score_events',
        'contractor_notifications'
    )
ORDER BY table_name;
