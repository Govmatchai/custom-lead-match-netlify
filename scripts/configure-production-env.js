#!/usr/bin/env node

console.log('🔧 Production Environment Configuration')
console.log('=====================================')

const requiredEnvVars = {
  'JWT_SECRET': process.env.JWT_SECRET ? '✅ Configured (64 chars)' : '❌ Missing',
  'RATE_LIMIT_ENABLED': 'true',
  'TWO_FACTOR_ISSUER': 'Custom Lead Match',
  'SUPABASE_URL': process.env.SUPABASE_URL ? '✅ Configured' : '❌ Missing',
  'SUPABASE_SERVICE_KEY': process.env.SUPABASE_SERVICE_KEY ? '✅ Configured' : '❌ Missing'
}

console.log('\n📋 Required Environment Variables:')
for (const [key, value] of Object.entries(requiredEnvVars)) {
  console.log(`${key}: ${value}`)
}

console.log('\n🔐 JWT Secret Status:')
if (process.env.JWT_SECRET) {
  console.log(`✅ JWT_SECRET is configured (${process.env.JWT_SECRET.length} characters)`)
  console.log(`   First 20 chars: ${process.env.JWT_SECRET.substring(0, 20)}...`)
} else {
  console.log('❌ JWT_SECRET not found in environment')
}

console.log('\n📝 Netlify Environment Variables to Configure:')
console.log('1. JWT_SECRET=' + (process.env.JWT_SECRET || 'MISSING'))
console.log('2. RATE_LIMIT_ENABLED=true')
console.log('3. TWO_FACTOR_ISSUER=Custom Lead Match')

console.log('\n✅ Configuration script completed')
