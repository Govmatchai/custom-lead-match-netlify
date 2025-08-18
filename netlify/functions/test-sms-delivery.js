import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

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
    const testResults = {
      timestamp: new Date().toISOString(),
      twilio_config: {
        account_sid: process.env.TWILIO_ACCOUNT_SID ? 'configured' : 'missing',
        auth_token: process.env.TWILIO_AUTH_TOKEN ? 'configured' : 'missing',
        phone_number: process.env.TWILIO_PHONE_NUMBER || 'missing'
      },
      tests: {}
    };

    const testPhone = '+15551234567';
    try {
      console.log(`Testing SMS to ${testPhone}`);
      const result = await twilioClient.messages.create({
        body: 'Test SMS from Custom Lead Match - Please ignore this message.',
        from: process.env.TWILIO_PHONE_NUMBER,
        to: testPhone
      });
      
      testResults.tests.valid_phone = {
        success: true,
        phone: testPhone,
        message_sid: result.sid,
        status: result.status
      };
    } catch (error) {
      testResults.tests.valid_phone = {
        success: false,
        phone: testPhone,
        error: error.message,
        error_code: error.code
      };
    }

    try {
      const account = await twilioClient.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
      testResults.account_info = {
        status: account.status,
        type: account.type,
        friendly_name: account.friendlyName
      };
    } catch (error) {
      testResults.account_info = {
        error: error.message
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(testResults, null, 2)
    };
  } catch (error) {
    console.error('❌ SMS test error:', error);
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
