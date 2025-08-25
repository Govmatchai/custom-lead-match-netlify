import { createClient } from '@supabase/supabase-js'
import twilio from 'twilio'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

export const handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      }
    }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 
        'Content-Type': 'application/json', 
        'Access-Control-Allow-Origin': '*' 
      },
      body: JSON.stringify({ detail: 'Method not allowed' })
    }
  }

  try {
    const { phone_number, message } = JSON.parse(event.body)
    
    if (!phone_number) {
      return {
        statusCode: 400,
        headers: { 
          'Content-Type': 'application/json', 
          'Access-Control-Allow-Origin': '*' 
        },
        body: JSON.stringify({ detail: 'phone_number is required' })
      }
    }
    
    const testMessage = message || '🧪 Test SMS from Custom Lead Match admin panel'
    
    const smsResult = await twilioClient.messages.create({
      body: testMessage,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone_number
    })

    await supabase
      .from('sms_send_log')
      .insert({
        phone_number,
        message_content: testMessage,
        category: 'test',
        location: 'admin',
        cost_cents: 79,
        status: 'sent',
        twilio_sid: smsResult.sid
      })

    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json', 
        'Access-Control-Allow-Origin': '*' 
      },
      body: JSON.stringify({ 
        message: 'Test SMS sent successfully',
        sid: smsResult.sid
      })
    }
  } catch (error) {
    console.error('Error sending test SMS:', error)
    return {
      statusCode: 500,
      headers: { 
        'Content-Type': 'application/json', 
        'Access-Control-Allow-Origin': '*' 
      },
      body: JSON.stringify({ 
        detail: 'Failed to send test SMS', 
        error: error.message 
      })
    }
  }
}
