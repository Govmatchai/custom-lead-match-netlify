import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '../../.env' })

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export const handler = async (event, context) => {
  console.log('=== CONTRACTORS SIGNUP WITH SUPABASE TEST ===')
  console.log('Event:', event.httpMethod)
  
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
