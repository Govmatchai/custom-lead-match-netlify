import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '../../.env' })

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export const handler = async (event, context) => {
  console.log('=== CONTRACTORS SIGNUP DEBUG START ===')
  console.log('Environment check:', {
    hasSupabaseUrl: !!process.env.SUPABASE_URL,
    hasSupabaseKey: !!process.env.SUPABASE_SERVICE_KEY,
    url: process.env.URL
  })

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
    console.log('Parsing request body...')
    const { business_name, contact_name, email, phone, industry, sub_service, zip_codes, sms_opt_in } = JSON.parse(event.body)
    console.log('Parsed data:', { business_name, contact_name, email, phone, industry, sub_service, zip_codes, sms_opt_in })

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
    console.log('Processed ZIP codes:', zipCodesArray)

    console.log('Attempting Supabase insert...')
    console.log('Insert data:', {
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
    
    const { data: existingContractor } = await supabase
      .from('contractors')
      .select('email')
      .eq('email', email)
      .single()
    
    if (existingContractor) {
      console.log('Email already exists:', email)
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ success: false, message: 'Email address is already registered' })
      }
    }
    
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
        sms_opt_in: sms_opt_in || false,
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
        body: JSON.stringify({ success: false, message: error.message })
      }
    }

    console.log('Contractor created successfully:', contractor.id)

    try {
      console.log('Attempting to call send-welcome-email function...')
      const welcomeEmailUrl = `${process.env.URL || 'https://customleadmatch.netlify.app'}/.netlify/functions/send-welcome-email`
      console.log('Welcome email URL:', welcomeEmailUrl)
      
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
      
      console.log('Welcome email response status:', welcomeEmailResponse.status)
      if (!welcomeEmailResponse.ok) {
        const errorText = await welcomeEmailResponse.text()
        console.error('Failed to send welcome email:', errorText)
      } else {
        console.log('Welcome email sent successfully')
      }
    } catch (emailError) {
      console.error('Welcome email fetch error:', emailError)
      console.error('Error details:', emailError.message, emailError.stack)
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
    console.error('Error details:', error.message, error.stack)
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ success: false, message: error.message || 'Failed to register contractor' })
    }
  }
}
