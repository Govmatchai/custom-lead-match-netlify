import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export const handler = async (event, context) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json'
  }

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    }
  }

  try {
    const contractorId = '426198f7-dd8b-4d5d-8139-4f9d9df58658'
    
    console.log('🔍 Testing contractor_leads query step by step...')
    
    const { data: contractorLeads, error: clError } = await supabase
      .from('contractor_leads')
      .select('*')
      .eq('contractor_id', contractorId)
      .eq('status', 'available')
    
    console.log('Step 1 - contractor_leads query:', { contractorLeads, clError })
    
    const leadIds = contractorLeads?.map(cl => cl.lead_id) || []
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .in('id', leadIds)
    
    console.log('Step 2 - leads query:', { leads, leadsError })
    
    const { data: joinResult, error: joinError } = await supabase
      .from('contractor_leads')
      .select(`
        id,
        status,
        created_at,
        leads (
          id,
          service_category,
          sub_service,
          zip_code,
          description,
          urgency,
          created_at,
          customer_name,
          customer_phone,
          customer_email
        )
      `)
      .eq('contractor_id', contractorId)
      .eq('status', 'available')
    
    console.log('Step 3 - join query:', { joinResult, joinError })
    
    const manualJoin = contractorLeads?.map(cl => {
      const lead = leads?.find(l => l.id === cl.lead_id)
      return {
        ...lead,
        contractor_lead_id: cl.id,
        contractor_lead_status: cl.status
      }
    }).filter(item => item.id) || []
    
    console.log('Step 4 - manual join result:', manualJoin)
    
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        debug: {
          contractor_id: contractorId,
          step1_contractor_leads: contractorLeads,
          step1_error: clError,
          step2_leads: leads,
          step2_error: leadsError,
          step3_join_result: joinResult,
          step3_error: joinError,
          step4_manual_join: manualJoin,
          lead_ids_found: leadIds
        }
      })
    }
  } catch (error) {
    console.error('Debug error:', error)
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: 'Debug failed', 
        message: error.message,
        stack: error.stack
      })
    }
  }
}
