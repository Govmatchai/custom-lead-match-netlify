import { createClient } from '@supabase/supabase-js'
import twilio from 'twilio'
import { randomBytes } from 'crypto'
import { validateLead } from './lead-validation.js'
import dotenv from 'dotenv'

dotenv.config({ path: '../../.env' })

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

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
    const { customer_name, service_category, sub_service, zip_code, phone, email, description } = data
    const clientIP = event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'unknown'

    const { status, validationFlags } = await validateLead(data, clientIP)

    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert([{
        customer_name,
        service_category,
        sub_service,
        zip_code,
        phone,
        email,
        description,
        ip_address: clientIP,
        status,
        validation_flags: validationFlags,
        claimed: false
      }])
      .select()
      .single()

    if (leadError) {
      console.error('Lead creation error:', leadError)
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ detail: leadError.message })
      }
    }

    const { data: matchingContractors, error: contractorError } = await supabase
      .from('contractors')
      .select('*')
      .eq('industry', service_category)
      .eq('sub_service', sub_service)
      .contains('zip_codes', [zip_code])
      .gt('lead_credits', 0)
      .eq('sms_opt_in', true)

    if (contractorError) {
      console.error('Contractor query error:', contractorError)
    }

    let contractorsNotified = 0
    if (status === 'valid' && matchingContractors && matchingContractors.length > 0) {
      const token = randomBytes(16).toString('hex')
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

      const { error: tokenError } = await supabase
        .from('claim_tokens')
        .insert([{
          token,
          lead_id: lead.id,
          expires_at: expiresAt.toISOString()
        }])

      if (tokenError) {
        console.error('Token creation error:', tokenError)
      }

      const claimUrl = `${process.env.URL || 'https://customleadmatch.netlify.app'}/claim/${token}`
      
      for (const contractor of matchingContractors) {
        try {
          await twilioClient.messages.create({
            body: `🔥 New ${service_category} Lead: ${zip_code} - ${sub_service}. Pre-screened & validated. Click to claim: ${claimUrl}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: contractor.phone
          })
          contractorsNotified++
        } catch (smsError) {
          console.error('SMS error for contractor', contractor.id, ':', smsError)
        }
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: status === 'valid' ? 'Lead submitted successfully! Matching contractors have been notified.' : 
                 status === 'pending_review' ? 'Lead received and is being reviewed for quality.' :
                 status === 'duplicate' ? 'Similar lead already exists. Please wait before submitting again.' :
                 'Lead received but requires additional review.',
        lead_id: lead.id,
        status,
        contractors_notified: contractorsNotified,
        validation_summary: {
          phone_valid: validationFlags.phone_valid,
          email_valid: validationFlags.email_format_valid,
          is_duplicate: validationFlags.is_duplicate || false,
          content_valid: !validationFlags.content_invalid
        }
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
