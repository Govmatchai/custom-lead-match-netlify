import { createClient } from '@supabase/supabase-js'
import twilio from 'twilio'
import dotenv from 'dotenv'

dotenv.config({ path: '../../.env' })

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const body = event.body
    const params = new URLSearchParams(body)
    
    const from = params.get('From')
    const messageBody = params.get('Body')?.trim().toUpperCase()
    
    console.log(`📱 Incoming SMS from ${from}: "${messageBody}"`)

    const stopKeywords = ['STOP', 'END', 'CANCEL', 'QUIT', 'UNSUBSCRIBE']
    if (stopKeywords.includes(messageBody)) {
      const { error: updateError } = await supabase
        .from('contractors')
        .update({ sms_opt_in: false })
        .eq('phone', from.replace('+1', ''))

      if (updateError) {
        console.error('Failed to update contractor opt-out:', updateError)
      } else {
        console.log(`✅ Contractor ${from} opted out of SMS`)
      }

      await twilioClient.messages.create({
        body: "CLM: You've been unsubscribed from Contractor Lead Alerts. No further messages will be sent.",
        from: process.env.TWILIO_PHONE_NUMBER,
        to: from
      })

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/xml' },
        body: '<?xml version="1.0" encoding="UTF-8"?><Response></Response>'
      }
    }

    if (messageBody === 'HELP') {
      await twilioClient.messages.create({
        body: "CLM: We send lead alerts to subscribed contractors. Msg freq varies. Msg&data rates may apply. Support: support@customleadmatch.com",
        from: process.env.TWILIO_PHONE_NUMBER,
        to: from
      })

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/xml' },
        body: '<?xml version="1.0" encoding="UTF-8"?><Response></Response>'
      }
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/xml' },
      body: '<?xml version="1.0" encoding="UTF-8"?><Response></Response>'
    }

  } catch (error) {
    console.error('Error processing incoming SMS:', error)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/xml' },
      body: '<?xml version="1.0" encoding="UTF-8"?><Response></Response>'
    }
  }
}
