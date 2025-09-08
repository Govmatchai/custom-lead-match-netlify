import { createClient } from '@supabase/supabase-js'
import bcryptjs from 'bcryptjs'
import { randomBytes } from 'crypto'
import dotenv from 'dotenv'
import twilio from 'twilio'

dotenv.config({ path: '../../.env' })

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

let twilioClient = null
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
}

exports.handler = async (event, context) => {

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
    const { business_name, contact_name, email, phone, username, password, industry, sub_service, zip_codes, sms_opt_in } = JSON.parse(event.body)

    if (!business_name || !contact_name || !email || !phone || !username || !password || !industry || !sub_service || !zip_codes) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ success: false, message: 'Missing required fields' })
      }
    }

    const saltRounds = 12
    const password_hash = await bcryptjs.hash(password, saltRounds)

    const zipCodesArray = zip_codes.split(',').map(zip => zip.trim()).filter(zip => zip.length > 0)

    console.log('Attempting contractors table insert...')
    const { data: contractor, error } = await supabase
      .from('contractors')
      .insert({
        business_name,
        contact_name,
        email,
        phone,
        username,
        password_hash,
        industry,
        sub_service,
        zip_codes: zipCodesArray,
        sms_opt_in: sms_opt_in || false,
        lead_credits: 3,
        wallet_balance: 25.00
      })
      .select()
      .single()

    if (error) {
      console.error('Contractors table insert failed:', error)
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        hint: error.hint,
        details: error.details
      })
      
      let userMessage = 'Failed to register contractor'
      
      if (error.code === '23505') {
        if (error.message.includes('contractors_email_key')) {
          userMessage = 'An account with this email address already exists. Please use a different email or try logging in.'
        } else if (error.message.includes('contractors_username_key')) {
          userMessage = 'This username is already taken. Please choose a different username.'
        } else {
          userMessage = 'An account with these details already exists. Please check your information.'
        }
      }
      
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          success: false, 
          message: userMessage,
          error_code: error.code
        })
      }
    }

    console.log('Contractors table insert successful:', contractor.id)

    const sessionToken = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    const { error: sessionError } = await supabase
      .from('contractor_sessions')
      .insert({
        contractor_id: contractor.id,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString()
      })

    if (sessionError) {
      console.error('Error creating session:', sessionError)
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ success: false, message: 'Failed to create session' })
      }
    }

    try {
      const welcomeEmailUrl = `${process.env.URL || 'https://customleadmatch.netlify.app'}/.netlify/functions/email-welcome`
      
      const welcomeEmailResponse = await fetch(welcomeEmailUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: email,
          first_name: contact_name,
          email: email,
          company: business_name
        })
      })
      
      if (!welcomeEmailResponse.ok) {
        const errorText = await welcomeEmailResponse.text()
        console.error('Failed to send welcome email:', errorText)
      }
    } catch (emailError) {
      console.error('Welcome email fetch error:', emailError)
    }

    if (sms_opt_in && twilioClient && phone) {
      try {
        let formattedPhone = phone.replace(/\D/g, '')
        if (formattedPhone.length === 10) {
          formattedPhone = '+1' + formattedPhone
        } else if (formattedPhone.length === 11 && formattedPhone.startsWith('1')) {
          formattedPhone = '+' + formattedPhone
        }

        const confirmationMessage = "CLM: You're subscribed to Contractor Lead Alerts. Msg frequency varies. Msg&data rates may apply. Reply STOP to opt out, HELP for help. Support: support@customleadmatch.com"
        
        await twilioClient.messages.create({
          body: confirmationMessage,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: formattedPhone
        })
        
        console.log(`✅ Opt-in confirmation SMS sent to ${formattedPhone}`)
      } catch (smsError) {
        console.error('Failed to send opt-in confirmation SMS:', smsError)
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'Contractor registered successfully!',
        contractor_id: contractor.id,
        session_token: sessionToken,
        redirect_url: `/welcome?contractor_id=${contractor.id}`
      })
    }
  } catch (error) {
    console.error('Error in contractor signup:', error)
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ success: false, message: 'Failed to register contractor' })
    }
  }
}
