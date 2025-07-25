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

  try {
    console.log('=== TESTING CONTRACTORS TABLE INSERT ===')
    
    console.log('Test 1: Basic insert')
    const { data: test1, error: error1 } = await supabase
      .from('contractors')
      .insert({
        business_name: 'Test Company',
        contact_name: 'Test User',
        email: 'test-' + Date.now() + '@example.com',
        phone: '555-999-0001',
        industry: 'Home Services',
        sub_service: 'Plumbing',
        zip_codes: ['12345']
      })
      .select()
      .single()

    if (error1) {
      console.error('Test 1 FAILED:', error1)
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          success: false, 
          test: 'basic_insert',
          error: error1.message,
          details: error1,
          hint: error1.hint || 'No hint provided'
        })
      }
    }

    console.log('Test 1 SUCCESS:', test1.id)

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'Contractors table insert works!',
        contractor_id: test1.id
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
