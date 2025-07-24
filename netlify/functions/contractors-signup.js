import { createClient } from '@supabase/supabase-js'
import sgMail from '@sendgrid/mail'
import dotenv from 'dotenv'

dotenv.config({ path: '../../.env' })

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

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
      body: JSON.stringify({ detail: 'Method not allowed' })
    }
  }

  try {
    const data = JSON.parse(event.body)
    const { business_name, contact_name, email, phone, industry, sub_service, zip_codes, sms_opt_in } = data

    const zipCodesArray = zip_codes.split(',').map(zip => zip.trim())

    const { data: contractor, error } = await supabase
      .from('contractors')
      .insert([{
        business_name,
        contact_name,
        email,
        phone,
        industry,
        sub_service,
        zip_codes: zipCodesArray,
        sms_opt_in,
        lead_credits: 3
      }])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ detail: error.message })
      }
    }

    try {
      const msg = {
        to: email,
        from: 'noreply@customleadmatch.com',
        subject: 'Welcome to Custom Lead Match!',
        html: `
          <h2>Welcome to Custom Lead Match!</h2>
          <p>Hi ${contact_name},</p>
          <p>Thank you for signing up! Your contractor ID is: <strong>${contractor.id}</strong></p>
          <p>You have 3 free lead credits to get started. You'll receive SMS notifications when new leads match your services.</p>
          <p>Service Category: ${industry} - ${sub_service}</p>
          <p>Service Areas: ${zipCodesArray.join(', ')}</p>
          <p>Best regards,<br>Custom Lead Match Team</p>
        `
      }
      await sgMail.send(msg)
    } catch (emailError) {
      console.error('Email error:', emailError)
    }

    try {
      const welcomeEmailResponse = await fetch(`${process.env.URL || 'https://customleadmatch.netlify.app'}/.netlify/functions/send-welcome-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contractor_id: contractor.id,
          email: email,
          name: contact_name,
          business_name: business_name
        })
      })
      
      if (!welcomeEmailResponse.ok) {
        console.error('Failed to send welcome email:', await welcomeEmailResponse.text())
      }
    } catch (emailError) {
      console.error('Welcome email error:', emailError)
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
        redirect_url: `/welcome?contractor_id=${contractor.id}`
      })
    }
  } catch (error) {
    console.error('Error:', error)
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ detail: 'Internal server error' })
    }
  }
}
