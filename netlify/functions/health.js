import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import fetch from 'node-fetch';

export async function handler() {
  const results = {
    supabase: 'unknown',
    stripe: 'unknown',
    postmark: 'unknown',
    twilio: 'unknown',
    timestamp: new Date().toISOString()
  };

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
    
    const { data, error } = await supabase.from('contractors').select('id').limit(1);
    if (error) {
      results.supabase = `error: ${error.message}`;
    } else {
      results.supabase = data && data.length > 0 ? 'ok' : 'no data';
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    try {
      const balance = await stripe.balance.retrieve();
      results.stripe = balance ? 'ok' : 'no balance data';
    } catch (stripeError) {
      results.stripe = `error: ${stripeError.message}`;
    }

    try {
      const postmarkRes = await fetch('https://api.postmarkapp.com/server', {
        headers: { 
          'X-Postmark-Server-Token': process.env.POSTMARK_TOKEN,
          'Accept': 'application/json'
        },
      });
      results.postmark = postmarkRes.ok ? 'ok' : `error: ${postmarkRes.status}`;
    } catch (postmarkError) {
      results.postmark = `error: ${postmarkError.message}`;
    }

    try {
      const twilioAuth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');
      const twilioRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}.json`, {
        headers: { 
          'Authorization': `Basic ${twilioAuth}`,
          'Accept': 'application/json'
        },
      });
      results.twilio = twilioRes.ok ? 'ok' : `error: ${twilioRes.status}`;
    } catch (twilioError) {
      results.twilio = `error: ${twilioError.message}`;
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(results, null, 2),
    };
  } catch (err) {
    return { 
      statusCode: 500, 
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        error: err.message,
        results,
        timestamp: new Date().toISOString()
      }, null, 2) 
    };
  }
}
