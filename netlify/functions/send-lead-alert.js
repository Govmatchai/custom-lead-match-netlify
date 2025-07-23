import twilio from 'twilio'
import dotenv from 'dotenv'

dotenv.config({ path: '../../.env' })

export const handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
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
      body: JSON.stringify({ success: false, message: 'Method not allowed' })
    }
  }

  try {
    const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = process.env
    
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      console.error('Missing Twilio environment variables:', {
        hasSid: !!TWILIO_ACCOUNT_SID,
        hasToken: !!TWILIO_AUTH_TOKEN,
        hasPhone: !!TWILIO_PHONE_NUMBER
      })
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          success: false, 
          message: 'Twilio configuration missing',
          details: 'Environment variables not properly configured'
        })
      }
    }

    const data = JSON.parse(event.body)
    const { industry, location, leadType, link } = data

    if (!industry || !location || !leadType || !link) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ success: false, message: 'Missing required fields' })
      }
    }

    const testPhoneNumber = '+12345678900'
    const smsMessage = `🔥 New ${industry} Lead: ${location} - ${leadType}. Click to claim: ${link}`

    const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

    try {
      const message = await twilioClient.messages.create({
        body: smsMessage,
        from: TWILIO_PHONE_NUMBER,
        to: testPhoneNumber
      })

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: true,
          message: 'Test SMS sent successfully',
          messageSid: message.sid,
          smsContent: smsMessage,
          sentTo: testPhoneNumber
        })
      }
    } catch (smsError) {
      console.error('Twilio SMS error:', smsError)
      
      const errorMessage = smsError.message || 'Unknown Twilio error'
      const errorCode = smsError.code || 'NO_CODE'
      const errorDetails = smsError.moreInfo || 'No additional details'
      
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          success: false, 
          message: `Failed to send SMS: ${errorMessage}`,
          error: errorMessage,
          code: errorCode,
          details: errorDetails,
          twilioFrom: TWILIO_PHONE_NUMBER,
          twilioTo: testPhoneNumber
        })
      }
    }
  } catch (error) {
    console.error('General error:', error)
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        success: false, 
        message: `Internal server error: ${error.message || 'Unknown error'}`,
        error: error.message || 'Unknown error'
      })
    }
  }
}
