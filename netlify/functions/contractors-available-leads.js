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

  if (event.httpMethod !== 'GET') {
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
    const { contractor_id, session_token } = event.queryStringParameters || {}

    if (!contractor_id || !session_token) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ detail: 'Contractor ID and session token are required' })
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
        body: JSON.stringify({ detail: 'Invalid or expired session' })
      }
    }

    const { data: contractor, error: contractorError } = await supabase
      .from('contractors')
      .select('*')
      .eq('id', contractor_id)
      .single()

    if (contractorError || !contractor) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ detail: 'Contractor not found' })
      }
    }

    console.log('Querying contractor_leads for contractor:', contractor_id)
    
    const { data: contractorLeadsData, error: clError } = await supabase
      .from('contractor_leads')
      .select('id, lead_id, status, created_at')
      .eq('contractor_id', contractor_id)
      .eq('status', 'available')
      .order('created_at', { ascending: false })

    console.log('Contractor leads query result:', { contractorLeadsData, clError })

    if (clError) {
      console.error('Contractor leads query error:', clError)
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          detail: 'Database query error', 
          error: clError.message,
          debug: { contractor_id, step: 'contractor_leads_query' }
        })
      }
    }

    if (!contractorLeadsData || contractorLeadsData.length === 0) {
      console.log('No contractor_leads entries found for contractor:', contractor_id)
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          available_leads: [],
          total_available: 0,
          debug: { contractor_id, contractor_leads_count: 0 }
        })
      }
    }

    const leadIds = contractorLeadsData.map(cl => cl.lead_id)
    console.log('Fetching leads for IDs:', leadIds)

    const { data: leadsData, error: leadsError } = await supabase
      .from('leads')
      .select('id, service_category, sub_service, zip_code, description, urgency, created_at, customer_name, customer_phone, customer_email')
      .in('id', leadIds)

    console.log('Leads query result:', { leadsData, leadsError })

    if (leadsError) {
      console.error('Leads query error:', leadsError)
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          detail: 'Database query error', 
          error: leadsError.message,
          debug: { contractor_id, step: 'leads_query', lead_ids: leadIds }
        })
      }
    }

    const availableLeads = contractorLeadsData.map(cl => {
      const lead = leadsData?.find(l => l.id === cl.lead_id)
      if (!lead) {
        console.warn('Lead not found for contractor_lead:', cl.id, 'lead_id:', cl.lead_id)
        return null
      }
      return {
        ...lead,
        contractor_lead_id: cl.id,
        contractor_lead_status: cl.status
      }
    }).filter(Boolean)

    console.log('Final available leads after manual join:', availableLeads)

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        available_leads: availableLeads || [],
        total_available: availableLeads ? availableLeads.length : 0
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
