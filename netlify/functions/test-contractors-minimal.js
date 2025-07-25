import { createClient } from '@supabase/supabase-js'

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
    console.log('Testing contractors table insert with minimal hardcoded data...')
    
    const testData = {
      business_name: 'Test Company Minimal',
      contact_name: 'Test User',
      email: 'test-minimal-' + Date.now() + '@example.com',
      phone: '555-999-0001',
      industry: 'Home Services',
      sub_service: 'Plumbing',
      zip_codes: ['12345']
    }
    
    console.log('Insert data:', testData)
    
    const { data: contractor, error } = await supabase
      .from('contractors')
      .insert(testData)
      .select()
      .single()

    if (error) {
      console.error('CONTRACTORS INSERT FAILED:', error)
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        hint: error.hint,
        details: error.details
      })
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          success: false, 
          error: error.message,
          code: error.code,
          hint: error.hint,
          details: error.details
        })
      }
    }

    console.log('CONTRACTORS INSERT SUCCESS:', contractor.id)
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'Contractors table insert works!',
        contractor_id: contractor.id
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
