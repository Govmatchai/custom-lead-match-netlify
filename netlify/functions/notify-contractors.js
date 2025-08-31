import { createClient } from '@supabase/supabase-js';
import twilio from 'twilio';
import { sendEmail } from './lib/sendgrid.js';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_ACCOUNT_SID !== 'your_twilio_account_sid_here') {
  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

export async function notifyContractorsForLead(lead, targetContractors) {
  const results = {
    sms_sent: 0,
    emails_sent: 0,
    errors: []
  };

  for (const contractor of targetContractors) {
    try {
      const walletBalance = contractor.wallet_balance || 0;

      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data: recentPurchases } = await supabase
        .from('purchased_leads')
        .select('id')
        .eq('contractor_id', contractor.id)
        .gte('purchased_at', thirtyDaysAgo)
        .limit(1);

      const isInactive = !recentPurchases || recentPurchases.length === 0;

      if (isInactive) {
        await sendInactiveContractorEmail(contractor);
        results.emails_sent++;
      } else if (walletBalance >= 20.00) {
        await sendWalletFundedNotifications(contractor, lead);
        results.sms_sent++;
        results.emails_sent++;
      } else {
        await sendNoFundsEmail(contractor, lead);
        results.emails_sent++;
      }
    } catch (error) {
      console.error(`Error notifying contractor ${contractor.id}:`, error);
      results.errors.push({ contractor_id: contractor.id, error: error.message });
    }
  }

  return results;
}

async function sendWalletFundedNotifications(contractor, lead) {
  const smsMessage = `🚨 New Lead Alert! A customer in your area needs ${lead.sub_service}. Log in now to claim before it's gone: https://customleadmatch.com/dashboard`;
  
  let formattedPhone = contractor.phone.replace(/\D/g, '');
  if (formattedPhone.length === 10) {
    formattedPhone = '+1' + formattedPhone;
  } else if (formattedPhone.length === 11 && formattedPhone.startsWith('1')) {
    formattedPhone = '+' + formattedPhone;
  }

  try {
    console.log(`📱 Attempting to send SMS to ${formattedPhone} for contractor ${contractor.id}`);
    
    if (formattedPhone.includes('555') && process.env.NODE_ENV !== 'production') {
      console.log(`⚠️ Skipping SMS to test number ${formattedPhone} in development`);
      return;
    }
    
    if (!twilioClient) {
      console.log(`⚠️ Twilio not configured, skipping SMS to ${formattedPhone}`);
      return;
    }
    
    const smsResult = await twilioClient.messages.create({
      body: smsMessage,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone
    });
    console.log(`✅ SMS sent successfully to ${formattedPhone}:`, smsResult.sid);
    
    await supabase
      .from('sms_send_log')
      .insert({
        contractor_id: contractor.id,
        lead_id: lead.id,
        phone_number: formattedPhone,
        message_content: smsMessage,
        category: lead.service_category,
        sub_category: lead.sub_service,
        location: lead.zip_code,
        cost_cents: 79,
        status: 'sent',
        twilio_sid: smsResult.sid
      });
  } catch (smsError) {
    console.error(`❌ SMS failed for ${formattedPhone}:`, smsError.message);
    console.log(`📧 Continuing with email notification for contractor ${contractor.id}`);
    
    await supabase
      .from('sms_send_log')
      .insert({
        contractor_id: contractor.id,
        lead_id: lead.id,
        phone_number: formattedPhone,
        message_content: smsMessage,
        category: lead.service_category,
        sub_category: lead.sub_service,
        location: lead.zip_code,
        cost_cents: 0,
        status: 'failed',
        error_message: smsError.message
      });
  }

  const emailSubject = 'New Exclusive Lead Available – Claim It Now';
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>New Lead Alert!</h2>
      <p>Hi ${contractor.contact_name},</p>
      <p>A new customer in your area is looking for <strong>${lead.sub_service}</strong>. Because you have funds in your wallet, you can claim this lead instantly.</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="https://customleadmatch.com/dashboard" style="background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">👉 Claim Lead Now</a>
      </p>
      <p>Remember: Leads are exclusive – once claimed, they're gone.</p>
      <p>Best regards,<br>The Custom Lead Match Team</p>
    </div>
  `;

  await sendEmail(contractor.email, emailSubject, emailHtml);
}

async function sendNoFundsEmail(contractor, lead) {
  const emailSubject = 'You\'re Missing Out – Add Funds to Claim This Lead';
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Lead Available - Wallet Top-Up Required</h2>
      <p>Hi ${contractor.contact_name},</p>
      <p>A new customer in your area is looking for <strong>${lead.sub_service}</strong>. Unfortunately, you don't have enough funds in your wallet to claim this lead.</p>
      <p>Don't miss out – top up your wallet today and be ready for the next exclusive lead.</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="https://customleadmatch.com/dashboard" style="background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">👉 Add Funds Now</a>
      </p>
      <p>Best regards,<br>The Custom Lead Match Team</p>
    </div>
  `;

  await sendEmail(contractor.email, emailSubject, emailHtml);
}

async function sendInactiveContractorEmail(contractor) {
  const emailSubject = 'Exclusive Leads Are Waiting – Don\'t Miss Out';
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>We Miss You!</h2>
      <p>Hi ${contractor.contact_name},</p>
      <p>We noticed you haven't purchased any leads in the last 30 days. During this time, other contractors have been connecting with exclusive customers in your area.</p>
      <p>Don't let opportunities pass you by – log in today, top up your wallet, and start claiming high-quality leads again.</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="https://customleadmatch.com/dashboard" style="background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">👉 Claim Leads Now</a>
      </p>
      <p>Best regards,<br>The Custom Lead Match Team</p>
    </div>
  `;

  await sendEmail(contractor.email, emailSubject, emailHtml);
}

export const handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      }
    };
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({ message: 'Notification function ready' })
  };
};
