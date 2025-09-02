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
    console.log('🧪 Testing contractor_leads table insertion...')
    
    const { data: tableTest, error: tableError } = await supabase
      .from('contractor_leads')
      .select('id')
      .limit(1)
    
    console.log('Table accessibility test:', { tableTest, tableError })
    
    const { data: contractor, error: contractorError } = await supabase
      .from('contractors')
      .select('id, business_name, industry, sub_service, zip_codes, wallet_balance')
      .eq('email', 'freshsaltyair@gmail.com')
      .single()
    
    console.log('Test contractor:', { contractor, contractorError })
    
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('id, service_category, sub_service, zip_code, status')
      .eq('id', '043dd8a7-f006-4b59-835a-cdb32622772d')
      .single()
    
    console.log('Test lead:', { lead, leadError })
    
    if (!contractor || !lead) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ 
          error: 'Test contractor or lead not found',
          contractor: contractor,
          lead: lead
        })
      }
    }
    
    const testEntry = {
      contractor_id: contractor.id,
      lead_id: lead.id,
      status: 'available',
      created_at: new Date().toISOString()
    }
    
    console.log('Attempting to insert:', testEntry)
    
    const { data: insertResult, error: insertError } = await supabase
      .from('contractor_leads')
      .insert([testEntry])
      .select()
    
    console.log('Insert result:', { insertResult, insertError })
    
    const { data: verifyResult, error: verifyError } = await supabase
      .from('contractor_leads')
      .select('*')
      .eq('contractor_id', contractor.id)
      .eq('lead_id', lead.id)
    
    console.log('Verification result:', { verifyResult, verifyError })
    
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: !insertError,
        tests: {
          table_accessible: !tableError,
          contractor_found: !!contractor,
          lead_found: !!lead,
          insert_successful: !insertError,
          entry_verified: !!verifyResult?.length
        },
        data: {
          contractor: contractor,
          lead: lead,
          insert_result: insertResult,
          verify_result: verifyResult
        },
        errors: {
          table_error: tableError,
          contractor_error: contractorError,
          lead_error: leadError,
          insert_error: insertError,
          verify_error: verifyError
        }
      })
    }
  } catch (error) {
    console.error('Test error:', error)
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: 'Test failed', 
        message: error.message,
        stack: error.stack
      })
    }
  }
}
