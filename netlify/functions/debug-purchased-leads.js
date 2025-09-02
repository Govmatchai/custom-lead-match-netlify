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
    
    console.log('🔍 Testing purchased leads query step by step...')
    
    const { data: allContractorLeads, error: allError } = await supabase
      .from('contractor_leads')
      .select('*')
      .eq('contractor_id', contractorId)
    
    console.log('Step 1 - All contractor_leads:', { allContractorLeads, allError })
    
    const { data: purchasedContractorLeads, error: purchasedError } = await supabase
      .from('contractor_leads')
      .select('*')
      .eq('contractor_id', contractorId)
      .eq('status', 'purchased')
    
    console.log('Step 2 - Purchased contractor_leads:', { purchasedContractorLeads, purchasedError })
    
    const { data: joinResult, error: joinError } = await supabase
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
      .eq('contractor_id', contractorId)
      .eq('status', 'purchased')
      .order('purchased_at', { ascending: false })
    
    console.log('Step 3 - Join query result:', { joinResult, joinError })
    
    const { data: contractor, error: contractorError } = await supabase
      .from('contractors')
      .select('wallet_balance')
      .eq('id', contractorId)
      .single()
    
    console.log('Step 4 - Contractor wallet:', { contractor, contractorError })
    
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        debug: {
          contractor_id: contractorId,
          step1_all_contractor_leads: allContractorLeads,
          step1_error: allError,
          step2_purchased_contractor_leads: purchasedContractorLeads,
          step2_error: purchasedError,
          step3_join_result: joinResult,
          step3_error: joinError,
          step4_contractor: contractor,
          step4_error: contractorError
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
