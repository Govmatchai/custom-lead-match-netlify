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

    console.log('Querying purchased leads for contractor:', contractor_id)
    
    const { data: purchasedLeads, error: purchasedError } = await supabase
      .from('contractor_leads')
      .select(`
        id,
        status,
        created_at,
        purchased_at,
        leads (
          id,
          customer_name,
          service_category,
          sub_service,
          zip_code,
          description,
          created_at,
          phone,
          email
        )
      `)
      .eq('contractor_id', contractor_id)
      .eq('status', 'purchased')
      .order('purchased_at', { ascending: false })

    console.log('Purchased leads query result:', { purchasedLeads, purchasedError })

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

    console.log('Processing purchased leads:', purchasedLeads?.length || 0)
    
    const activePurchasedLeads = purchasedLeads?.map(cl => ({
      ...cl.leads,
      contractor_lead_id: cl.id,
      contractor_lead_status: cl.status,
      purchased_at: cl.purchased_at
    })).filter(lead => lead.id && !lead.is_archived) || []
    
    const archivedPurchasedLeads = purchasedLeads?.filter(lead => lead.leads?.is_archived) || []
    const completedLeads = purchasedLeads?.filter(lead => lead.status === 'completed') || []
    
    console.log('Final processed leads:', { 
      active: activePurchasedLeads.length, 
      archived: archivedPurchasedLeads.length, 
      completed: completedLeads.length 
    })

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        purchased_leads: [...activePurchasedLeads, ...archivedPurchasedLeads],
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
