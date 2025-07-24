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
    console.log('=== MINIMAL CONTRACTORS INSERT TEST ===')
    
    console.log('Test 1: Minimal required fields only')
    const { data: test1, error: error1 } = await supabase
      .from('contractors')
      .insert({
        business_name: 'Test Company Minimal',
        contact_name: 'Test User',
        email: 'test-minimal-' + Date.now() + '@example.com',
        phone: '555-999-0001',
        industry: 'Home Services',
        sub_service: 'Plumbing',
        zip_codes: ['12345']
      })
      .select()
      .single()

    if (error1) {
      console.error('Test 1 failed:', error1)
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          success: false, 
          test: 'minimal_fields',
          error: error1.message,
          details: error1
        })
      }
    }

    console.log('Test 1 SUCCESS:', test1.id)

    console.log('Test 2: With all fields including optional ones')
    const { data: test2, error: error2 } = await supabase
      .from('contractors')
      .insert({
        business_name: 'Test Company Full',
        contact_name: 'Test User Full',
        email: 'test-full-' + Date.now() + '@example.com',
        phone: '555-999-0002',
        industry: 'Home Services',
        sub_service: 'Plumbing',
        zip_codes: ['12345', '67890'],
        sms_opt_in: true,
        lead_credits: 3
      })
      .select()
      .single()

    if (error2) {
      console.error('Test 2 failed:', error2)
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          success: false, 
          test: 'full_fields',
          error: error2.message,
          details: error2
        })
      }
    }

    console.log('Test 2 SUCCESS:', test2.id)

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'Both tests passed',
        test1_id: test1.id,
        test2_id: test2.id
      })
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        success: false, 
        message: error.message,
        stack: error.stack
      })
    }
  }
}
