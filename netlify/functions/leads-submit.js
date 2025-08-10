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
    
    let clientIP = event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'unknown'
    if (clientIP !== 'unknown' && clientIP.includes(',')) {
      clientIP = clientIP.split(',')[0].trim()
    }

    console.log('🔍 Lead submission received:')
    console.log('- customer_name:', customer_name)
    console.log('- service_category:', service_category)
    console.log('- sub_service:', sub_service)
    console.log('- zip_code:', zip_code)
    console.log('- phone:', phone)
    console.log('- email:', email)
    console.log('- description:', description)
    console.log('Raw body:', event.body)

    const { status, validationFlags } = await validateLead(data, clientIP)
    
    try {
      const { logValidationMetrics } = await import('./validation-metrics.js')
      await logValidationMetrics({
        status,
        validationFlags,
        serviceCategory: service_category,
        zipCode: zip_code
      })
    } catch (metricsError) {
      console.error('Error logging validation metrics:', metricsError)
    }

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

    if (lead && status === 'valid') {
      try {
        const { logValidationMetrics } = await import('./validation-metrics.js')
        await logValidationMetrics({
          status,
          validationFlags,
          leadId: lead.id,
          serviceCategory: service_category,
          zipCode: zip_code
        })
      } catch (metricsError) {
        console.error('Error logging validation metrics with lead ID:', metricsError)
      }
      
      try {
        const scoreResponse = await fetch(`${process.env.URL || 'https://customleadmatch.netlify.app'}/.netlify/functions/score-lead`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lead_id: lead.id })
        })
        console.log('Lead scored:', lead.id)
      } catch (scoreError) {
        console.error('Scoring error:', scoreError)
      }
    }

    if (leadError) {
      console.error('Lead creation error:', leadError)
      
      if (leadError.message && leadError.message.includes('match_contractors_for_lead')) {
        console.log('Database trigger error detected, continuing with SMS processing...')
        
        const mockLead = {
          id: `temp-${Date.now()}`,
          customer_name,
          service_category,
          sub_service,
          zip_code,
          phone,
          email,
          description,
          status
        }
        
        const { data: matchingContractors, error: contractorError } = await supabase
          .from('contractors')
          .select('*')
          .eq('industry', service_category)
          .eq('sub_service', sub_service)
          .contains('zip_codes', [zip_code])
          .gt('lead_credits', 0)
          .eq('sms_opt_in', true)

        console.log(`Found ${matchingContractors?.length || 0} matching contractors for ${service_category}/${sub_service} in ${zip_code}`)
        if (contractorError) {
          console.error('Contractor query error:', contractorError)
        }

        let contractorsNotified = 0
        if (status === 'valid' && matchingContractors && matchingContractors.length > 0) {
          for (const contractor of matchingContractors) {
            try {
              let formattedPhone = contractor.phone.replace(/\D/g, '') // Remove all non-digits
              if (formattedPhone.length === 10) {
                formattedPhone = '+1' + formattedPhone // Add US country code
              } else if (formattedPhone.length === 11 && formattedPhone.startsWith('1')) {
                formattedPhone = '+' + formattedPhone // Add + prefix
              } else {
                console.error(`Invalid phone number format for contractor ${contractor.id}: ${contractor.phone}`)
                continue
              }
              
              console.log(`Attempting to send SMS to contractor ${contractor.id} at ${formattedPhone} (original: ${contractor.phone})`)
              
              await twilioClient.messages.create({
                body: `🔥 New ${service_category} Lead: ${zip_code} - ${sub_service}. Emergency plumbing repair needed. Contact: ${phone}`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: formattedPhone
              })
              contractorsNotified++
              console.log(`✅ SMS sent successfully to contractor ${contractor.id} at ${formattedPhone}`)
            } catch (smsError) {
              console.error(`❌ SMS error for contractor ${contractor.id}:`, smsError.message)
              console.error('Error code:', smsError.code)
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
            message: `Lead processed successfully! ${contractorsNotified} contractors have been notified via SMS.`,
            lead_id: mockLead.id,
            status,
            contractors_notified: contractorsNotified,
            note: 'SMS notifications sent despite database trigger issue'
          })
        }
      }
      
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
          let formattedPhone = contractor.phone
          
          if (!contractor.phone.startsWith('+')) {
            formattedPhone = contractor.phone.replace(/\D/g, '') // Remove all non-digits
            if (formattedPhone.length === 10) {
              formattedPhone = '+1' + formattedPhone // Add US country code
            } else if (formattedPhone.length === 11 && formattedPhone.startsWith('1')) {
              formattedPhone = '+' + formattedPhone // Add + prefix
            } else {
              console.error(`Invalid phone number format for contractor ${contractor.id}: ${contractor.phone}`)
              continue
            }
          }
          
          console.log(`Attempting to send SMS to contractor ${contractor.id} at ${formattedPhone} (original: ${contractor.phone})`)
          
          await twilioClient.messages.create({
            body: `🔥 New ${service_category} Lead: ${zip_code} - ${sub_service}. Pre-screened & validated. Click to claim: ${claimUrl}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: formattedPhone
          })
          contractorsNotified++
          console.log(`✅ SMS sent successfully to contractor ${contractor.id} at ${formattedPhone}`)
        } catch (smsError) {
          console.error(`❌ SMS error for contractor ${contractor.id}:`, smsError.message)
          console.error('Error code:', smsError.code)
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
