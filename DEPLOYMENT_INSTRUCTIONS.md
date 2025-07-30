# Automated Lead Delivery System - Deployment Instructions

This document provides step-by-step instructions for deploying the automated lead delivery and claiming system.

## Overview

The system consists of three main components:
1. **Supabase Edge Function** - Automatically matches contractors when leads are inserted
2. **Database Trigger** - Triggers the Edge Function on lead insertion
3. **Claim Lead API** - Secure endpoint for contractors to claim leads

## 1. Database Setup

Execute the following SQL files in your Supabase database in this order:

### Step 1: Create Transactions Table
```sql
-- Execute: database/transactions-table.sql
```

### Step 2: Set up Lead Matching Trigger
```sql
-- Execute: database/lead-matching-trigger.sql
```

### Step 3: Add Test Data (Optional)
```sql
-- Execute: database/insert-test-data-e2e.sql
```

## 2. Supabase Edge Function Deployment

### Step 1: Install Supabase CLI
```bash
npm install -g supabase
```

### Step 2: Login to Supabase
```bash
supabase login
```

### Step 3: Link to your project
```bash
supabase link --project-ref nkubtsnpkdghfnukduuv
```

### Step 4: Deploy the Edge Function
```bash
# Copy the Deno implementation
cp supabase/functions/match-contractors-for-lead/deno-implementation.ts supabase/functions/match-contractors-for-lead/index.ts

# Deploy the function
supabase functions deploy match-contractors-for-lead
```

### Step 5: Set Environment Variables
```bash
supabase secrets set TWILIO_ACCOUNT_SID=your_actual_twilio_sid
supabase secrets set TWILIO_AUTH_TOKEN=your_actual_twilio_token
supabase secrets set TWILIO_PHONE_NUMBER=+13157844568
```

## 3. Update Database Trigger URL

After deploying the Edge Function, update the trigger to use the correct URL:

```sql
-- Update the trigger function with your actual Supabase project URL
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
END;
$$ LANGUAGE plpgsql;
```

## 4. Local Testing

### Test the API endpoints locally:
```bash
# Run the test script
chmod +x scripts/test-automated-system.sh
./scripts/test-automated-system.sh
```

### Manual API Testing:
```bash
# Test claim-lead endpoint
curl -X POST http://localhost:8888/.netlify/functions/claim-lead \
  -H "Content-Type: application/json" \
  -d '{"contractor_id": "15f0808d-9c87-41a1-8a7e-a5e01e329cb1", "lead_id": "test-lead-e2e-001"}'

# Test data verification
curl -X GET http://localhost:8888/.netlify/functions/test-claim-lead
```

## 5. Production Testing

### Test 1: Insert a Test Lead
```sql
INSERT INTO leads (customer_name, service_category, sub_service, zip_code, phone, email, description, status) 
VALUES ('Test Customer', 'home_services', 'plumbing', '12345', '555-0123', 'test@example.com', 'Test lead for automation', 'valid');
```

### Test 2: Verify Contractor Matching
Check that contractors with matching criteria receive SMS notifications.

### Test 3: Test Claim Lead API
```bash
curl -X POST https://customleadmatch.netlify.app/.netlify/functions/claim-lead \
  -H "Content-Type: application/json" \
  -d '{"contractor_id": "contractor-uuid", "lead_id": "lead-uuid"}'
```

## 6. Monitoring and Troubleshooting

### View Edge Function Logs
```bash
supabase functions logs match-contractors-for-lead
```

### Check Database Trigger Execution
```sql
-- Check if trigger is active
SELECT * FROM information_schema.triggers WHERE trigger_name = 'after_lead_insert_trigger';
```

### Verify Twilio SMS Delivery
Check your Twilio console for SMS delivery status and any error messages.

## API Endpoints

### Claim Lead Endpoint
- **URL**: `https://customleadmatch.netlify.app/.netlify/functions/claim-lead`
- **Method**: POST
- **Body**: `{"contractor_id": "uuid", "lead_id": "uuid"}`
- **Response**: `{"success": true, "message": "Lead claimed successfully!", "lead": {...}}`

### Test Endpoint (Development)
- **URL**: `https://customleadmatch.netlify.app/.netlify/functions/test-claim-lead`
- **Method**: GET
- **Response**: Test data verification and system status

## Implementation Details

### Contractor Matching Logic
The Edge Function matches contractors based on:
- `contractors.zip_codes` contains `leads.zip_code`
- `contractors.industry = leads.service_category`
- `contractors.sub_service = leads.sub_service`
- `contractors.sms_opt_in = true`

### Wallet Balance System
- Uses `transactions` table to track contractor wallet balance
- Lead claiming deducts $10.00 from contractor balance
- Insufficient balance prevents lead claiming

### SMS Notification Format
```
🔥 New {service_category} Lead: {zip_code} - {sub_service}. Pre-screened & validated. Click to claim: {claim_url}
```

## Security Notes

- The claim-lead API validates contractor existence and wallet balance
- Edge Function only sends SMS to contractors with `sms_opt_in = true`
- All database operations use row-level security policies
- Twilio credentials are stored as Supabase secrets, not in code
- Lead claiming requires valid contractor_id and lead_id

## Troubleshooting Common Issues

1. **Edge Function not triggering**: Check trigger is properly created and active
2. **SMS not sending**: Verify Twilio credentials and phone number format
3. **Claim API failing**: Check wallet balance and lead availability
4. **Build errors**: Ensure TypeScript compatibility (Edge Function uses separate Deno runtime)
5. **Database connection issues**: Verify Supabase credentials and table existence
