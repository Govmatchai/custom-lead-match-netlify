import { createClient } from '@supabase/supabase-js';
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
    const errorTests = {
      timestamp: new Date().toISOString(),
      tests: {},
      summary: {
        total_tests: 0,
        passed: 0,
        failed: 0
      }
    };

    console.log('🧪 Testing invalid email handling');
    const invalidEmailTest = await testInvalidEmailHandling();
    errorTests.tests.invalid_email = invalidEmailTest;
    errorTests.summary.total_tests++;
    if (invalidEmailTest.success) errorTests.summary.passed++;
    else errorTests.summary.failed++;

    console.log('🧪 Testing invalid phone handling');
    const invalidPhoneTest = await testInvalidPhoneHandling();
    errorTests.tests.invalid_phone = invalidPhoneTest;
    errorTests.summary.total_tests++;
    if (invalidPhoneTest.success) errorTests.summary.passed++;
    else errorTests.summary.failed++;

    console.log('🧪 Testing database error handling');
    const dbErrorTest = await testDatabaseErrorHandling();
    errorTests.tests.database_error = dbErrorTest;
    errorTests.summary.total_tests++;
    if (dbErrorTest.success) errorTests.summary.passed++;
    else errorTests.summary.failed++;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(errorTests, null, 2)
    };
  } catch (error) {
    console.error('❌ Error test execution failed:', error);
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

async function testInvalidEmailHandling() {
  try {
    const result = await sendEmail(
      'invalid-email-address',
      'Test Subject',
      '<p>Test email content</p>'
    );

    return {
      success: !result.success && result.error,
      expected: 'Email should fail with invalid address',
      actual: result,
      test_type: 'invalid_email_address'
    };
  } catch (error) {
    return {
      success: true,
      expected: 'Should catch and handle email error',
      actual: { error: error.message },
      test_type: 'invalid_email_address'
    };
  }
}

async function testInvalidPhoneHandling() {
  try {
    const result = await twilioClient.messages.create({
      body: 'Test SMS message',
      from: process.env.TWILIO_PHONE_NUMBER,
      to: 'invalid-phone-number'
    });

    return {
      success: false,
      expected: 'SMS should fail with invalid phone',
      actual: result,
      test_type: 'invalid_phone_number'
    };
  } catch (error) {
    return {
      success: true,
      expected: 'Should catch and handle SMS error',
      actual: { error: error.message },
      test_type: 'invalid_phone_number'
    };
  }
}

async function testDatabaseErrorHandling() {
  try {
    const { data, error } = await supabase
      .from('non_existent_table')
      .select('*')
      .limit(1);

    return {
      success: error !== null,
      expected: 'Database query should fail gracefully',
      actual: { data, error: error?.message },
      test_type: 'database_connection_error'
    };
  } catch (error) {
    return {
      success: true,
      expected: 'Should catch and handle database error',
      actual: { error: error.message },
      test_type: 'database_connection_error'
    };
  }
}
