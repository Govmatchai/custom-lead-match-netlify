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
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      }
    }
  }

  if (event.httpMethod !== 'GET') {
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
    const { contractor_id, session_token } = event.queryStringParameters || {}

    if (!contractor_id || !session_token) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ success: false, message: 'Contractor ID and session token are required' })
      }
    }

    const { data: session, error: sessionError } = await supabase
      .from('contractor_sessions')
      .select('*')
      .eq('session_token', session_token)
      .eq('contractor_id', contractor_id)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (sessionError || !session) {
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ success: false, message: 'Invalid or expired session' })
      }
    }

    const { data: purchasedLeads, error: purchasedError } = await supabase
      .from('purchased_leads')
      .select(`
        *,
        leads (
          id,
          customer_name,
          service_category,
          sub_service,
          zip_code,
          description,
          created_at,
          is_archived
        )
      `)
      .eq('contractor_id', contractor_id)
      .order('purchased_at', { ascending: false })

    if (purchasedError) {
      console.error('Error fetching purchased leads:', purchasedError)
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ success: false, message: 'Failed to fetch purchased leads' })
      }
    }

    const activePurchasedLeads = purchasedLeads.filter(lead => !lead.leads?.is_archived && (lead.status === 'active' || !lead.status))
    const archivedPurchasedLeads = purchasedLeads.filter(lead => lead.leads?.is_archived)
    const completedLeads = purchasedLeads.filter(lead => !lead.leads?.is_archived && lead.status === 'completed')

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        purchased_leads: activePurchasedLeads,
        archived_leads: archivedPurchasedLeads,
        completed_leads: completedLeads
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
      body: JSON.stringify({ success: false, message: 'Internal server error' })
    }
  }
}
