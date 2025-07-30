#!/bin/bash
set -e

echo "🧪 Testing Stripe Webhook After Environment Variable Fix"
echo "=================================================="

echo ""
echo "1. Testing webhook security (should return 400 for unsigned requests)..."
RESPONSE=$(curl -s -X POST https://customleadmatch.netlify.app/.netlify/functions/stripe-webhook \
  -H "Content-Type: application/json" \
  -H "Stripe-Signature: t=1234567890,v1=invalid_signature" \
  -d '{"test": "data"}' \
  -w "HTTP_STATUS:%{http_code}")

HTTP_STATUS=$(echo "$RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed 's/HTTP_STATUS:[0-9]*$//')

if [ "$HTTP_STATUS" = "400" ]; then
  echo "✅ Webhook security working (returns 400 for invalid signature)"
else
  echo "❌ Webhook security issue (expected 400, got $HTTP_STATUS)"
  echo "Response: $BODY"
fi

echo ""
echo "2. Creating test contractor for transaction testing..."
TEST_CONTRACTOR_RESPONSE=$(curl -s -X POST "https://customleadmatch.netlify.app/.netlify/functions/contractors-signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test-webhook@example.com",
    "business_name": "Test Webhook Company",
    "contact_name": "Test Contact",
    "phone": "555-0123",
    "username": "testwebhook",
    "password": "TestPassword123!",
    "industry": "home_services",
    "sub_service": "electrical",
    "zip_codes": "12345"
  }' \
  -w "HTTP_STATUS:%{http_code}")

TEST_HTTP_STATUS=$(echo "$TEST_CONTRACTOR_RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
TEST_BODY=$(echo "$TEST_CONTRACTOR_RESPONSE" | sed 's/HTTP_STATUS:[0-9]*$//')

if [ "$TEST_HTTP_STATUS" = "200" ]; then
  echo "✅ Test contractor created successfully"
  TEST_CONTRACTOR_ID=$(echo "$TEST_BODY" | grep -o '"contractor_id":"[^"]*"' | cut -d'"' -f4)
  echo "Test contractor ID: $TEST_CONTRACTOR_ID"
  
  echo ""
  echo "3. Testing transaction creation API with valid contractor..."
  RESPONSE=$(curl -s -X POST "https://customleadmatch.netlify.app/.netlify/functions/contractor-add-transaction" \
    -H "Content-Type: application/json" \
    -d "{
      \"contractor_id\": \"$TEST_CONTRACTOR_ID\",
      \"amount\": 10.00,
      \"source\": \"test\",
      \"notes\": \"Test transaction after env fix\"
    }" \
    -w "HTTP_STATUS:%{http_code}")

  HTTP_STATUS=$(echo "$RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
  BODY=$(echo "$RESPONSE" | sed 's/HTTP_STATUS:[0-9]*$//')

  if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ Transaction creation API working (returns 200)"
    echo "Response: $BODY"
  else
    echo "❌ Transaction creation API failed (got $HTTP_STATUS)"
    echo "Response: $BODY"
  fi
else
  echo "❌ Failed to create test contractor (got $TEST_HTTP_STATUS)"
  echo "Response: $TEST_BODY"
  echo "⚠️  Skipping transaction creation test due to missing test contractor"
  TEST_CONTRACTOR_ID="NONE"
fi

echo ""
echo "4. Testing wallet balance API..."
if [ "$TEST_CONTRACTOR_ID" != "NONE" ]; then
  RESPONSE=$(curl -s -X GET "https://customleadmatch.netlify.app/.netlify/functions/contractor-wallet-balance?contractor_id=$TEST_CONTRACTOR_ID" \
    -w "HTTP_STATUS:%{http_code}")

  HTTP_STATUS=$(echo "$RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
  BODY=$(echo "$RESPONSE" | sed 's/HTTP_STATUS:[0-9]*$//')

  if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ Wallet balance API working (returns 200)"
    echo "Response: $BODY"
  else
    echo "❌ Wallet balance API failed (got $HTTP_STATUS)"
    echo "Response: $BODY"
  fi
else
  echo "⚠️  Skipping wallet balance test due to missing test contractor"
fi

echo ""
echo "🎉 Webhook testing complete!"
echo ""
echo "📋 Next Steps:"
echo "- If transaction creation is working, test with real Stripe webhook events"
echo "- Configure Stripe dashboard to send events to: https://customleadmatch.netlify.app/.netlify/functions/stripe-webhook"
echo "- Test end-to-end payment flow with checkout.session.completed events"
