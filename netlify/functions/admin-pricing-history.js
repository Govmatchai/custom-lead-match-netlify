import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '../../.env' })

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export const handler = async (event, context) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers }
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ detail: 'Method not allowed' })
    }
  }

  try {
    const { data, error } = await supabase
      .from('pricing_history')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching pricing history:', error)
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ detail: 'Failed to fetch pricing history' })
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    }
  } catch (error) {
    console.error('Error in admin-pricing-history:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ detail: 'Internal server error' })
    }
  }
}
