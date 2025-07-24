import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || 'placeholder-key'
)

export const handler = async (event, context) => {
  console.log('=== CONTRACTORS SIGNUP DEBUG START ===')
  console.log('Event received:', {
    httpMethod: event.httpMethod,
    headers: event.headers,
    bodyLength: event.body ? event.body.length : 0
  })
  
  console.log('Environment check:', {
    hasSupabaseUrl: !!process.env.SUPABASE_URL,
    hasSupabaseKey: !!process.env.SUPABASE_SERVICE_KEY,
    hasSendGridKey: !!process.env.SENDGRID_API_KEY
  })
  
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    console.error('Missing Supabase environment variables')
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ detail: 'Server configuration error' })
    }
  }

  if (event.httpMethod === 'OPTIONS') {
    console.log('Handling OPTIONS request')
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
    console.log('Invalid method:', event.httpMethod)
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
    console.log('Starting contractor signup process...')
    
    let data
    try {
      data = JSON.parse(event.body)
      console.log('Parsed request data successfully:', data)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ detail: 'Invalid JSON in request body' })
      }
    }
    
    const { business_name, contact_name, email, phone, industry, sub_service, zip_codes, sms_opt_in } = data
    
    const requiredFields = { business_name, contact_name, email, phone, industry, sub_service, zip_codes }
    const missingFields = Object.entries(requiredFields).filter(([key, value]) => !value).map(([key]) => key)
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields)
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ detail: `Missing required fields: ${missingFields.join(', ')}` })
      }
    }

    const zipCodesArray = zip_codes.split(',').map(zip => zip.trim())
    console.log('Processed ZIP codes:', zipCodesArray)

    console.log('Attempting Supabase insert...')
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
      console.error('Supabase error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ detail: error.message })
      }
    }

    console.log('Contractor created successfully:', contractor.id)

    console.log('Skipping SendGrid email (removed for debugging)')

    try {
      console.log('Attempting to call send-welcome-email function...')
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
      } else {
        console.log('Welcome email function called successfully')
      }
    } catch (emailError) {
      console.error('Welcome email fetch error:', emailError)
    }

    console.log('Contractor signup completed successfully')
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
