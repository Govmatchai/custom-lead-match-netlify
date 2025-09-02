import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '../../.env' })

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
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
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
    const contractors = [
      {
        email: 'freshhvac15@example.com',
        username: 'freshhvac15',
        password_hash: '$2b$10$abcdefghijklmnopqrstuvwxyz123456789',
        business_name: 'Fresh HVAC Co',
        company_name: 'Fresh HVAC Co',
        phone: '555-123-1515',
        service_category: 'Home Services',
        industry: 'home_services',
        sub_service: 'hvac',
        zip_codes: ['98765'],
        service_zips: ['98765'],
        wallet_balance: 50.00,
        is_sms_enabled: true,
        sms_opt_in: true
      },
      {
        email: 'govhvac01@example.com',
        username: 'govhvac01',
        password_hash: '$2b$10$abcdefghijklmnopqrstuvwxyz123456789',
        business_name: 'Gov HVAC LLC',
        company_name: 'Gov HVAC LLC',
        phone: '555-123-0101',
        service_category: 'Home Services',
        industry: 'home_services',
        sub_service: 'hvac',
        zip_codes: ['98765'],
        service_zips: ['98765'],
        wallet_balance: 50.00,
        is_sms_enabled: true,
        sms_opt_in: true
      }
    ]

    const results = []
    
    for (const contractor of contractors) {
      const { data, error } = await supabase
        .from('contractors')
        .insert([contractor])
        .select()

      if (error) {
        console.error(`Error creating contractor ${contractor.username}:`, error)
        results.push({ 
          username: contractor.username, 
          success: false, 
          error: error.message 
        })
      } else {
        console.log(`Successfully created contractor ${contractor.username}`)
        results.push({ 
          username: contractor.username, 
          success: true, 
          id: data[0].id 
        })
      }
    }

    const successful = results.filter(r => r.success)
    const failed = results.filter(r => !r.success)

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: `Created ${successful.length} contractors, ${failed.length} failed`,
        successful: successful,
        failed: failed,
        results: results
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
      body: JSON.stringify({ detail: 'Internal server error', error: error.message })
    }
  }
}
