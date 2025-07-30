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
echo "2. Testing transaction creation API..."
RESPONSE=$(curl -s -X POST "https://customleadmatch.netlify.app/.netlify/functions/contractor-add-transaction" \
  -H "Content-Type: application/json" \
  -d '{
    "contractor_id": "550e8400-e29b-41d4-a716-446655440000",
    "amount": 10.00,
    "source": "test",
    "notes": "Test transaction after env fix"
  }' \
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

echo ""
echo "3. Testing wallet balance API..."
RESPONSE=$(curl -s -X GET "https://customleadmatch.netlify.app/.netlify/functions/contractor-wallet-balance?contractor_id=550e8400-e29b-41d4-a716-446655440000" \
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

echo ""
echo "🎉 Webhook testing complete!"
echo ""
echo "📋 Next Steps:"
echo "- If transaction creation is working, test with real Stripe webhook events"
echo "- Configure Stripe dashboard to send events to: https://customleadmatch.netlify.app/.netlify/functions/stripe-webhook"
echo "- Test end-to-end payment flow with checkout.session.completed events"
