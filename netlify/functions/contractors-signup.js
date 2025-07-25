import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '../../.env' })

console.log('Environment check:', {
  hasUrl: !!process.env.SUPABASE_URL,
  hasKey: !!process.env.SUPABASE_SERVICE_KEY,
  urlPrefix: process.env.SUPABASE_URL?.substring(0, 20),
  keyPrefix: process.env.SUPABASE_SERVICE_KEY?.substring(0, 20)
})

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

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
    const { business_name, contact_name, email, phone, industry, sub_service, zip_codes, sms_opt_in } = JSON.parse(event.body)

    if (!business_name || !contact_name || !email || !phone || !industry || !sub_service || !zip_codes) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ success: false, message: 'Missing required fields' })
      }
    }

    const zipCodesArray = zip_codes.split(',').map(zip => zip.trim()).filter(zip => zip.length > 0)

    console.log('About to insert contractor with data:', {
      business_name,
      contact_name,
      email,
      phone,
      industry,
      sub_service,
      zip_codes: zipCodesArray,
      sms_opt_in: sms_opt_in || false,
      lead_credits: 3
    })

    console.log('Testing Supabase connection...')
    const { data: testData, error: testError } = await supabase
      .from('contractors')
      .select('id')
      .limit(1)

    if (testError) {
      console.error('Connection test failed:', testError)
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          success: false, 
          message: 'Database connection failed',
          error: testError.message,
          details: testError
        })
      }
    }

    console.log('Connection test passed, proceeding with insert...')

    const { data: contractor, error } = await supabase
      .from('contractors')
      .insert({
        business_name,
        contact_name,
        email,
        phone,
        industry,
        sub_service,
        zip_codes: zipCodesArray,
        sms_opt_in: sms_opt_in || false,
        lead_credits: 3
      })
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
        body: JSON.stringify({ success: false, message: error.message })
      }
    }

    try {
      const welcomeEmailUrl = `${process.env.URL || 'https://customleadmatch.netlify.app'}/.netlify/functions/send-welcome-email`
      
      const welcomeEmailResponse = await fetch(welcomeEmailUrl, {
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
        const errorText = await welcomeEmailResponse.text()
        console.error('Failed to send welcome email:', errorText)
      }
    } catch (emailError) {
      console.error('Welcome email fetch error:', emailError)
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
