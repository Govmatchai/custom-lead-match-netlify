#!/bin/bash

echo "🧪 Testing Automated Lead Delivery and Claiming System"
echo "=================================================="

echo ""
echo "1. Testing claim-lead API endpoint..."
curl -X POST http://localhost:8888/.netlify/functions/claim-lead \
  -H "Content-Type: application/json" \
  -d '{"contractor_id": "15f0808d-9c87-41a1-8a7e-a5e01e329cb1", "lead_id": "test-lead-e2e-001"}' \
  -w "\nStatus: %{http_code}\n"

echo ""
echo "2. Testing test data endpoint..."
curl -X GET http://localhost:8888/.netlify/functions/test-claim-lead \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n"

echo ""
echo "3. Testing mark-lead-complete endpoint..."
curl -X POST http://localhost:8888/.netlify/functions/mark-lead-complete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dummy-session-token" \
  -d '{"contractor_id": "15f0808d-9c87-41a1-8a7e-a5e01e329cb1", "lead_id": "test-lead-e2e-001"}' \
  -w "\nStatus: %{http_code}\n"

echo ""
echo "✅ Automated system testing complete!"
echo "Note: For full testing, execute the SQL files in database/ and deploy the Supabase Edge Function"
