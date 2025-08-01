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
    const data = JSON.parse(event.body)
    const { action } = data

    if (action === 'create_lead') {
      const { customer_name, phone, email, service_category, sub_service, zip_code, description } = data

      if (!customer_name || !phone || !service_category || !sub_service || !zip_code || !description) {
        return {
          statusCode: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ detail: 'All required fields must be provided' })
        }
      }

      const { data: lead, error } = await supabase
        .from('leads')
        .insert({
          customer_name,
          phone,
          email,
          service_category,
          sub_service,
          zip_code,
          description,
          status: 'valid',
          claimed: false,
          is_archived: false
        })
        .select()
        .single()

      if (error) {
        console.error('Lead creation error:', error)
        return {
          statusCode: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ detail: 'Failed to create lead' })
        }
      }

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ message: 'Lead created successfully', lead })
      }
    }

    if (action === 'seed_test_leads') {
      const testLeads = [
        {
          customer_name: 'Test Customer 1',
          phone: '(555) 123-4567',
          email: 'test1@example.com',
          service_category: 'home_services',
          sub_service: 'plumbing',
          zip_code: '12345',
          description: 'Test plumbing lead for QA purposes',
          status: 'valid'
        },
        {
          customer_name: 'Test Customer 2',
          phone: '(555) 234-5678',
          email: 'test2@example.com',
          service_category: 'home_services',
          sub_service: 'hvac',
          zip_code: '67890',
          description: 'Test HVAC lead for QA purposes',
          status: 'valid'
        }
      ]

      const { data: leads, error } = await supabase
        .from('leads')
        .insert(testLeads)
        .select()

      if (error) {
        console.error('Test leads creation error:', error)
        return {
          statusCode: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ detail: 'Failed to create test leads' })
        }
      }

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ message: `${leads.length} test leads created successfully`, leads })
      }
    }

    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ detail: 'Invalid action' })
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
