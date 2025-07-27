#!/bin/bash
set -e

echo "🔍 Verifying Netlify deployment..."

echo "Testing industries function..."
curl -f https://customleadmatch.netlify.app/.netlify/functions/industries > /dev/null || {
  echo "❌ Industries function failed"
  exit 1
}

echo "Testing sub-services function..."
curl -f "https://customleadmatch.netlify.app/.netlify/functions/sub-services?industry=home_services" > /dev/null || {
  echo "❌ Sub-services function failed"
  exit 1
}

echo "Testing signup function..."
curl -f https://customleadmatch.netlify.app/.netlify/functions/contractors-signup -X OPTIONS > /dev/null || {
  echo "❌ Signup function failed"
  exit 1
}

echo "✅ All critical functions are accessible"
echo "🎉 Deployment verification successful!"
