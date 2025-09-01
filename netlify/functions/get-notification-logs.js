import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '../../.env' })

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export const handler = async (event, context) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  }

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    }
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ detail: 'Method not allowed' })
    }
  }

  try {
    const limit = parseInt(event.queryStringParameters?.limit) || 100
    const level = event.queryStringParameters?.level
    const functionName = event.queryStringParameters?.function_name
    const leadId = event.queryStringParameters?.lead_id

    let query = supabase
      .from('notification_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit)

    if (level) {
      query = query.eq('level', level)
    }

    if (functionName) {
      query = query.eq('function_name', functionName)
    }

    if (leadId) {
      query = query.eq('lead_id', parseInt(leadId))
    }

    const { data: logs, error } = await query

    if (error) {
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ detail: 'Failed to fetch logs', error: error.message })
      }
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        logs,
        count: logs.length,
        timestamp: new Date().toISOString()
      })
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ detail: 'Internal server error', error: error.message })
    }
  }
}
