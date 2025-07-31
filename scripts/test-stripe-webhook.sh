#!/bin/bash

echo "🧪 Testing Stripe Webhook Functionality"
echo "========================================"

echo ""
echo "1. Testing webhook endpoint availability..."
curl -X POST "https://customleadmatch.netlify.app/.netlify/functions/stripe-webhook" \
  -H "Content-Type: application/json" \
  -d '{"type": "test"}' \
  -w "\nHTTP Status: %{http_code}\n"

echo ""
echo "2. Testing with sample checkout.session.completed event..."
curl -X POST "https://customleadmatch.netlify.app/.netlify/functions/stripe-webhook" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "checkout.session.completed",
    "data": {
      "object": {
        "id": "cs_test_123",
        "metadata": {
          "contractor_id": "15f0808d-9c87-41a1-8a7e-a5e01e329cb1",
          "credits": "5"
        }
      }
    }
  }' \
  -w "\nHTTP Status: %{http_code}\n"

echo ""
echo "3. Testing wallet balance endpoint..."
curl "https://customleadmatch.netlify.app/.netlify/functions/contractor-wallet-balance?contractor_id=15f0808d-9c87-41a1-8a7e-a5e01e329cb1" \
  -w "\nHTTP Status: %{http_code}\n"

echo ""
echo "✅ Webhook testing complete!"
echo "Note: Signature verification will still fail until Netlify environment variables are updated"
