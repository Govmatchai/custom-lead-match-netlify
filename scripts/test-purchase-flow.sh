#!/bin/bash

echo "🧪 Testing Lead Purchase Flow"
echo "============================="

echo "1. Testing lead purchase with sufficient balance..."
curl -X POST "https://customleadmatch.netlify.app/.netlify/functions/purchase-lead" \
  -H "Content-Type: application/json" \
  -d '{"lead_id": "test-lead-001", "contractor_id": "test-contractor-001", "session_token": "valid-token"}' \
  -w "\nHTTP Status: %{http_code}\n"

echo "2. Testing duplicate purchase prevention..."
curl -X POST "https://customleadmatch.netlify.app/.netlify/functions/purchase-lead" \
  -H "Content-Type: application/json" \
  -d '{"lead_id": "test-lead-001", "contractor_id": "test-contractor-001", "session_token": "valid-token"}' \
  -w "\nHTTP Status: %{http_code}\n"

echo "3. Testing insufficient balance scenario..."
curl -X POST "https://customleadmatch.netlify.app/.netlify/functions/purchase-lead" \
  -H "Content-Type: application/json" \
  -d '{"lead_id": "test-lead-002", "contractor_id": "low-balance-contractor", "session_token": "valid-token"}' \
  -w "\nHTTP Status: %{http_code}\n"

echo "4. Checking wallet balance after purchase..."
curl "https://customleadmatch.netlify.app/.netlify/functions/contractor-wallet-balance?contractor_id=test-contractor-001" \
  -w "\nHTTP Status: %{http_code}\n"
