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
    const { count: totalContractors, error: contractorsError } = await supabase
      .from('contractors')
      .select('*', { count: 'exact', head: true })

    const { count: totalLeads, error: leadsError } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })

    const { count: claimedLeads, error: claimedError } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('claimed', true)

    const { count: unclaimedLeads, error: unclaimedError } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('claimed', false)

    if (contractorsError || leadsError || claimedError || unclaimedError) {
      console.error('Database query errors:', { contractorsError, leadsError, claimedError, unclaimedError })
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        total_contractors: totalContractors || 0,
        total_leads: totalLeads || 0,
        claimed_leads: claimedLeads || 0,
        unclaimed_leads: unclaimedLeads || 0
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
