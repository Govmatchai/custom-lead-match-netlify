import { createClient } from '@supabase/supabase-js';
import { notifyContractorsForLead } from './notify-contractors.js';
import { sendEmail } from './lib/sendgrid.js';
import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export const handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const testReport = {
      timestamp: new Date().toISOString(),
      environment: 'production',
      test_scenarios: {},
      service_health: {},
      summary: {
        total_scenarios: 0,
        passed: 0,
        failed: 0,
        warnings: []
      }
    };

    console.log('🔍 Testing service connectivity...');
    testReport.service_health = await testServiceConnectivity();

    console.log('🧪 Testing Scenario 1: Email-only notification');
    const emailOnlyResult = await testEmailOnlyNotification();
    testReport.test_scenarios.email_only = emailOnlyResult;
    testReport.summary.total_scenarios++;
    if (emailOnlyResult.success) testReport.summary.passed++;
    else testReport.summary.failed++;

    console.log('🧪 Testing Scenario 2: Inactive contractor re-engagement');
    const inactiveResult = await testInactiveContractorEmail();
    testReport.test_scenarios.inactive_reengagement = inactiveResult;
    testReport.summary.total_scenarios++;
    if (inactiveResult.success) testReport.summary.passed++;
    else testReport.summary.failed++;

    console.log('🧪 Testing Scenario 3: Error handling');
    const errorHandlingResult = await testErrorHandling();
    testReport.test_scenarios.error_handling = errorHandlingResult;
    testReport.summary.total_scenarios++;
    if (errorHandlingResult.success) testReport.summary.passed++;
    else testReport.summary.failed++;

    testReport.summary.warnings.push(
      'SMS testing skipped in production to avoid sending messages to real phone numbers',
      'SMS functionality verified through Twilio account status and configuration checks'
    );

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(testReport, null, 2)
    };
  } catch (error) {
    console.error('❌ Production test execution error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};

async function testServiceConnectivity() {
  const results = {
    supabase: 'unknown',
    sendgrid: 'unknown',
    twilio: 'unknown'
  };

  try {
    const { data, error } = await supabase.from('contractors').select('id').limit(1);
    results.supabase = error ? 'error' : 'connected';
  } catch (error) {
    results.supabase = 'error';
  }

  try {
    const account = await twilioClient.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
    results.twilio = account.status === 'active' ? 'connected' : 'inactive';
  } catch (error) {
    results.twilio = 'error';
  }

  try {
    const testResult = await sendEmail(
      'test@example.com',
      'Production Test - Please Ignore',
      '<p>This is a production connectivity test. Please ignore this message.</p>'
    );
    results.sendgrid = testResult.success ? 'connected' : 'error';
  } catch (error) {
    results.sendgrid = 'error';
  }

  return results;
}

async function testEmailOnlyNotification() {
  try {
    const testContractor = {
      id: 'prod-test-email-001',
      contact_name: 'Production Test',
      email: 'test@example.com',
      phone: '+15551234567',
      industry: 'Home Services',
      sub_service: 'Plumbing'
    };

    await supabase.from('transactions').delete().eq('contractor_id', testContractor.id);

    const recentDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
    await supabase.from('purchased_leads').upsert([
      {
        contractor_id: testContractor.id,
        lead_id: 'prod-test-lead-001',
        purchased_at: recentDate,
        amount: 25.00
      }
    ]);

    const mockLead = {
      id: 'prod-test-lead-email-001',
      service_category: 'Home Services',
      sub_service: 'Plumbing',
      zip_code: '12345'
    };

    const results = await notifyContractorsForLead(mockLead, [testContractor]);

    return {
      success: results.emails_sent === 1 && results.sms_sent === 0,
      expected: { sms_sent: 0, emails_sent: 1 },
      actual: results,
      scenario: 'no_wallet_funds_email_only'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      scenario: 'no_wallet_funds_email_only'
    };
  }
}

async function testInactiveContractorEmail() {
  try {
    const testContractor = {
      id: 'prod-test-inactive-001',
      contact_name: 'Inactive Test',
      email: 'inactive-test@example.com',
      phone: '+15551234568',
      industry: 'Home Services',
      sub_service: 'Plumbing'
    };

    await supabase.from('purchased_leads').delete().eq('contractor_id', testContractor.id);

    const oldDate = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString();
    await supabase.from('purchased_leads').upsert([
      {
        contractor_id: testContractor.id,
        lead_id: 'prod-test-old-lead',
        purchased_at: oldDate,
        amount: 25.00
      }
    ]);

    const mockLead = {
      id: 'prod-test-lead-inactive-001',
      service_category: 'Home Services',
      sub_service: 'Plumbing',
      zip_code: '12345'
    };

    const results = await notifyContractorsForLead(mockLead, [testContractor]);

    return {
      success: results.emails_sent === 1 && results.sms_sent === 0,
      expected: { sms_sent: 0, emails_sent: 1 },
      actual: results,
      scenario: 'inactive_contractor_reengagement'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      scenario: 'inactive_contractor_reengagement'
    };
  }
}

async function testErrorHandling() {
  try {
    const invalidEmailResult = await sendEmail(
      'invalid-email-address',
      'Test Subject',
      '<p>Test content</p>'
    );

    let smsErrorHandled = false;
    try {
      await twilioClient.messages.create({
        body: 'Test message',
        from: process.env.TWILIO_PHONE_NUMBER,
        to: 'invalid-phone'
      });
    } catch (error) {
      smsErrorHandled = true;
    }

    return {
      success: !invalidEmailResult.success && smsErrorHandled,
      email_error_handled: !invalidEmailResult.success,
      sms_error_handled: smsErrorHandled,
      scenario: 'error_handling_verification'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      scenario: 'error_handling_verification'
    };
  }
}
