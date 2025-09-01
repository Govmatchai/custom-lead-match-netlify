import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'crypto'
import { validateLead } from './lead-validation.js'
import { ProductionLogger } from './lib/logger.js'
import dotenv from 'dotenv'

dotenv.config({ path: '../../.env' })

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const logger = new ProductionLogger('leads-submit')

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

    console.log('🔍 Lead submission received at:', new Date().toISOString())
    console.log('📝 Lead data:')
    console.log('  - customer_name:', customer_name)
    console.log('  - service_category:', service_category)
    console.log('  - sub_service:', sub_service)
    console.log('  - zip_code:', zip_code)
    console.log('  - phone:', phone)
    console.log('  - email:', email)
    console.log('  - description:', description)
    console.log('🌐 Client IP:', clientIP)
    console.log('📦 Raw body:', event.body)

    await logger.info('LEAD SUBMISSION RECEIVED', {
      customer_name,
      service_category,
      sub_service,
      zip_code,
      phone,
      email,
      description,
      clientIP,
      timestamp: new Date().toISOString()
    })

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
        zip_code: validationFlags.zip_code_formatted || zip_code,
        phone: validationFlags.phone_formatted || phone,
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

      try {
        const distributeResponse = await fetch(`${process.env.URL || 'https://customleadmatch.netlify.app'}/.netlify/functions/distribute-leads`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`
          },
          body: JSON.stringify({ 
            lead_id: lead.id,
            force_distribute: true 
          })
        })
        
        if (distributeResponse.ok) {
          const distributionResult = await distributeResponse.json()
          console.log(`✅ Lead ${lead.id} distributed to ${distributionResult.contractors_notified || 0} contractors`)
          console.log(`📊 Distribution results:`, distributionResult)
          console.log(`📧 Email notifications sent: ${distributionResult.emails_sent || 0}`)
          console.log(`📱 SMS notifications sent: ${distributionResult.sms_sent || 0}`)
          console.log(`❌ Notification errors: ${distributionResult.errors?.length || 0}`)
          
          await logger.info('LEAD DISTRIBUTION SUCCESS', {
            leadId: lead.id,
            contractorsNotified: distributionResult.contractors_notified || 0,
            emailsSent: distributionResult.emails_sent || 0,
            smsSent: distributionResult.sms_sent || 0,
            errors: distributionResult.errors?.length || 0,
            distributionResult
          }, lead.id)
        } else {
          console.log(`⚠️ Lead distribution failed for ${lead.id}`)
          console.log(`⚠️ Distribution response status: ${distributeResponse.status}`)
          const errorText = await distributeResponse.text()
          console.log(`⚠️ Distribution error details:`, errorText)
          
          await logger.error('LEAD DISTRIBUTION FAILED', {
            leadId: lead.id,
            status: distributeResponse.status,
            errorText
          }, lead.id)
        }
      } catch (distributionError) {
        console.error('Distribution error:', distributionError)
      }
    }

    if (leadError) {
      console.error('Lead creation error:', leadError)
      
      console.log('Database error detected, attempting direct lead insertion without trigger...')
      
      const { data: leadWithoutTrigger, error: directInsertError } = await supabase
        .from('leads')
        .insert([{
          customer_name,
          service_category,
          sub_service,
          zip_code: validationFlags.zip_code_formatted || zip_code,
          phone: validationFlags.phone_formatted || phone,
          email,
          description,
          ip_address: clientIP,
          status,
          validation_flags: validationFlags,
          claimed: false
        }])
        .select()
        .single()

      if (leadWithoutTrigger && !directInsertError) {
        console.log(`✅ Lead ${leadWithoutTrigger.id} inserted successfully without trigger`)
        
        if (status === 'valid') {
          try {
            const matchResponse = await fetch(`${process.env.URL || 'https://customleadmatch.netlify.app'}/.netlify/functions/distribute-leads`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`
              },
              body: JSON.stringify({ 
                lead_id: leadWithoutTrigger.id,
                force_distribute: true 
              })
            })
            
            if (matchResponse.ok) {
              const matchResult = await matchResponse.json()
              console.log('✅ Contractor matching triggered successfully')
              console.log(`📊 Matching results:`, matchResult)
              console.log(`📧 Email notifications sent: ${matchResult.emails_sent || 0}`)
              console.log(`📱 SMS notifications sent: ${matchResult.sms_sent || 0}`)
              console.log(`❌ Matching errors: ${matchResult.errors?.length || 0}`)
            } else {
              console.log('⚠️ Contractor matching failed, but lead is stored')
              console.log(`⚠️ Matching response status: ${matchResponse.status}`)
              const errorText = await matchResponse.text()
              console.log(`⚠️ Matching error details:`, errorText)
            }
          } catch (matchError) {
            console.error('Contractor matching error:', matchError)
          }
        }

        const debugHeaders = {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          ...logger.getLogsAsHeaders()
        }

        return {
          statusCode: 200,
          headers: debugHeaders,
          body: JSON.stringify({
            message: status === 'valid' ? 'Lead submitted successfully! Matching contractors have been notified.' : 
                     status === 'pending_review' ? 'Lead received and is being reviewed for quality.' :
                     status === 'duplicate' ? 'Similar lead already exists. Please wait before submitting again.' :
                     status === 'invalid' ? 'Lead submission failed validation. Please check your information and try again.' :
                     'Lead received but requires additional review.',
            lead_id: leadWithoutTrigger.id,
            status,
            debug_logs: logger.getLogsAsString(),
            validation_summary: {
              required_fields: validationFlags.required_fields_valid,
              phone_valid: validationFlags.phone_valid,
              email_valid: validationFlags.email_format_valid,
              zip_code_valid: validationFlags.zip_code_valid,
              is_duplicate: validationFlags.is_duplicate || false,
              content_valid: !validationFlags.content_invalid
            }
          })
        }
      } else {
        console.error('Direct insertion also failed:', directInsertError)
        return {
          statusCode: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
            message: 'Unable to process lead at this time. Please try again later.',
            error: directInsertError?.message || 'Database connection failed',
            status: 'error'
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

    console.log(`Lead ${lead.id} created successfully with status: ${status}`)

    const debugHeaders = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      ...logger.getLogsAsHeaders()
    }

    return {
      statusCode: 200,
      headers: debugHeaders,
      body: JSON.stringify({
        message: status === 'valid' ? 'Lead submitted successfully! Matching contractors have been notified.' : 
                 status === 'pending_review' ? 'Lead received and is being reviewed for quality.' :
                 status === 'duplicate' ? 'Similar lead already exists. Please wait before submitting again.' :
                 status === 'invalid' ? 'Lead submission failed validation. Please check your information and try again.' :
                 'Lead received but requires additional review.',
        lead_id: lead.id,
        status,
        debug_logs: logger.getLogsAsString(),
        validation_summary: {
          required_fields: validationFlags.required_fields_valid,
          phone_valid: validationFlags.phone_valid,
          email_valid: validationFlags.email_format_valid,
          zip_code_valid: validationFlags.zip_code_valid,
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
