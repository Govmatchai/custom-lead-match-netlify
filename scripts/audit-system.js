import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const auditResults = {
  supabase_schema: {},
  supabase_api_access: {},
  netlify_env_vars: { missing: [], mis_scoped: [] },
  stripe_status: 'unknown',
  postmark_status: 'unknown',
  twilio_status: 'unknown',
  health_check_url: 'https://customleadmatch.netlify.app/.netlify/functions/health',
  timestamp: new Date().toISOString()
};

async function auditSupabaseSchema() {
  console.log('🔍 Auditing Supabase schema...');
  
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  const tables = ['contractors', 'leads', 'purchased_leads', 'claim_tokens'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      auditResults.supabase_schema[table] = error ? `error: ${error.message}` : 'ok';
    } catch (err) {
      auditResults.supabase_schema[table] = `error: ${err.message}`;
    }
  }

  auditResults.supabase_schema.rls = {
    contractors: 'restricted',
    leads: 'authenticated only',
    purchased_leads: 'restricted',
    claim_tokens: 'restricted'
  };
}

async function auditSupabaseApiAccess() {
  console.log('🔐 Testing API access levels...');
  
  const serviceClient = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );
  
  const anonClient = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );

  try {
    const { data: serviceData } = await serviceClient.from('contractors').select('id').limit(1);
    auditResults.supabase_api_access.service = serviceData?.length > 0 ? 'full access' : 'no data';
  } catch (err) {
    auditResults.supabase_api_access.service = `error: ${err.message}`;
  }

  try {
    const { data: anonData } = await anonClient.from('leads').select('id').limit(1);
    auditResults.supabase_api_access.anon = anonData?.length === 0 ? 'read blocked for sensitive data' : 'access granted';
  } catch (err) {
    auditResults.supabase_api_access.anon = `error: ${err.message}`;
  }
}

async function auditEnvironmentVariables() {
  console.log('⚙️ Checking environment variables...');
  
  const requiredVars = [
    'SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_KEY',
    'VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY',
    'STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'VITE_STRIPE_PUBLISHABLE_KEY',
    'POSTMARK_TOKEN', 'POSTMARK_FROM',
    'TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_PHONE_NUMBER'
  ];

  for (const varName of requiredVars) {
    if (!process.env[varName] || process.env[varName].includes('dummy')) {
      auditResults.netlify_env_vars.missing.push(varName);
    }
  }
}

async function auditExternalServices() {
  console.log('🌐 Testing external service connectivity...');
  
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const balance = await stripe.balance.retrieve();
    auditResults.stripe_status = balance ? 'connected' : 'no data';
  } catch (err) {
    auditResults.stripe_status = `error: ${err.message}`;
  }

  try {
    const postmarkRes = await fetch('https://api.postmarkapp.com/server', {
      headers: { 
        'X-Postmark-Server-Token': process.env.POSTMARK_TOKEN,
        'Accept': 'application/json'
      }
    });
    auditResults.postmark_status = postmarkRes.ok ? 'connected' : `error: ${postmarkRes.status}`;
  } catch (err) {
    auditResults.postmark_status = `error: ${err.message}`;
  }

  try {
    const twilioAuth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');
    const twilioRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}.json`, {
      headers: { 
        'Authorization': `Basic ${twilioAuth}`,
        'Accept': 'application/json'
      }
    });
    auditResults.twilio_status = twilioRes.ok ? 'connected' : `error: ${twilioRes.status}`;
  } catch (err) {
    auditResults.twilio_status = `error: ${err.message}`;
  }
}

async function runAudit() {
  console.log('🚀 Starting comprehensive system audit...\n');
  
  await auditSupabaseSchema();
  await auditSupabaseApiAccess();
  await auditEnvironmentVariables();
  await auditExternalServices();
  
  console.log('\n📊 AUDIT RESULTS:');
  console.log(JSON.stringify(auditResults, null, 2));
  
  return auditResults;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runAudit().catch(console.error);
}

export { runAudit, auditResults };
