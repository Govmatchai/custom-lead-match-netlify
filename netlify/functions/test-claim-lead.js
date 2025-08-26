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
    const testContractorId = '15f0808d-9c87-41a1-8a7e-a5e01e329cb1'
    const testLeadId = 'test-lead-e2e-001'

    const { data: contractor, error: contractorError } = await supabase
      .from('contractors')
      .select('*')
      .eq('id', testContractorId)
      .single()

    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', testLeadId)
      .single()

    const currentBalance = contractor ? contractor.wallet_balance || 0 : 0

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        test_data: {
          contractor_exists: !!contractor,
          contractor_error: contractorError?.message || null,
          lead_exists: !!lead,
          lead_error: leadError?.message || null,
          current_balance: currentBalance,
          transaction_error: transactionError?.message || null,
          claim_lead_endpoint: '/.netlify/functions/claim-lead',
          test_payload: {
            contractor_id: testContractorId,
            lead_id: testLeadId
          }
        }
      })
    }
  } catch (error) {
    console.error('Test error:', error)
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ success: false, message: 'Internal server error', error: error.message })
    }
  }
}
