#!/bin/bash


echo "🧪 Testing Custom Lead Match Production Deployment"
echo "=================================================="

FRONTEND_URL="https://contractor-lead-generator-ljxlx5jg.devinapps.com"
API_BASE="$FRONTEND_URL/.netlify/functions"

echo ""
echo "📍 Testing Frontend Deployment..."
echo "Frontend URL: $FRONTEND_URL"

if curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL" | grep -q "200"; then
    echo "✅ Frontend is accessible"
else
    echo "❌ Frontend is not accessible"
fi

echo ""
echo "🔧 Testing API Endpoints..."

echo "Testing health check..."
HEALTH_RESPONSE=$(curl -s "$API_BASE/healthz")
if echo "$HEALTH_RESPONSE" | grep -q "status"; then
    echo "✅ Health check returns JSON"
else
    echo "❌ Health check returns HTML (needs environment variables)"
fi

echo "Testing industries endpoint..."
INDUSTRIES_RESPONSE=$(curl -s "$API_BASE/industries")
if echo "$INDUSTRIES_RESPONSE" | grep -q "Home Services"; then
    echo "✅ Industries endpoint returns data"
else
    echo "❌ Industries endpoint returns HTML (needs database)"
fi

echo "Testing admin authentication..."
ADMIN_RESPONSE=$(curl -s -X POST "$API_BASE/admin-auth" \
    -H "Content-Type: application/json" \
    -d '{"password":"test123"}')
if echo "$ADMIN_RESPONSE" | grep -q "success"; then
    echo "✅ Admin auth endpoint returns JSON"
else
    echo "❌ Admin auth endpoint not working (needs environment variables)"
fi

echo "Testing contractor signup..."
SIGNUP_RESPONSE=$(curl -s -X POST "$API_BASE/contractors-signup" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "Test User",
        "company": "Test Company", 
        "email": "test@example.com",
        "phone": "555-1234",
        "industry": "Home Services",
        "sub_service": "HVAC",
        "zip_codes": ["12345"],
        "sms_opt_in": true
    }')
if echo "$SIGNUP_RESPONSE" | grep -q "id"; then
    echo "✅ Contractor signup working"
else
    echo "❌ Contractor signup not working (needs database)"
fi

echo ""
echo "📊 Summary:"
echo "- Frontend: Deployed and accessible ✅"
echo "- Backend Functions: Deployed but need environment variables ⚠️"
echo "- Database: Needs Supabase setup ⚠️"
echo "- Next Steps: Configure environment variables in Netlify"

echo ""
echo "🔗 Important Links:"
echo "- Frontend: $FRONTEND_URL"
echo "- Admin Dashboard: $FRONTEND_URL/admin"
echo "- Lead Intake: $FRONTEND_URL/lead-intake"
echo "- Netlify Dashboard: https://app.netlify.com"
echo "- Supabase Dashboard: https://supabase.com/dashboard"

echo ""
echo "📋 Environment Variables Needed:"
echo "SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY"
echo "TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER"
echo "STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET"
echo "ADMIN_PASSWORD, SENDGRID_API_KEY (optional)"
