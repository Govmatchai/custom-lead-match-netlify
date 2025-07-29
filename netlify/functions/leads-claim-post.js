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

  if (event.httpMethod !== 'POST') {
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
    const data = JSON.parse(event.body)
    const { token, contractor_id } = data

    if (!token || !contractor_id) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ success: false, message: 'Token and contractor ID are required' })
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
        body: JSON.stringify({ success: false, message: 'Contractor not found' })
      }
    }

    const { data: transactions, error: balanceError } = await supabase
      .from('transactions')
      .select('amount')
      .eq('contractor_id', contractor_id)

    if (balanceError) {
      console.error('Balance calculation error:', balanceError)
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ success: false, message: 'Failed to check balance' })
      }
    }

    const currentBalance = transactions.reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0)
    const leadPrice = 10.00

    if (currentBalance < leadPrice) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ success: false, message: 'Insufficient balance to purchase this lead.' })
      }
    }

    const { data: claimToken, error: tokenError } = await supabase
      .from('claim_tokens')
      .select('*, leads(*)')
      .eq('token', token)
      .single()

    if (tokenError || !claimToken) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ success: false, message: 'Invalid or expired token' })
      }
    }

    if (new Date(claimToken.expires_at) < new Date()) {
      return {
        statusCode: 410,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ success: false, message: 'Token has expired' })
      }
    }

    if (claimToken.leads.claimed) {
      return {
        statusCode: 410,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ success: false, message: 'Lead has already been claimed' })
      }
    }

    const { data: updatedLead, error: leadUpdateError } = await supabase
      .from('leads')
      .update({
        claimed: true,
        claimed_by: contractor_id,
        claimed_at: new Date().toISOString(),
        is_archived: true
      })
      .eq('id', claimToken.lead_id)
      .select()
      .single()

    if (leadUpdateError) {
      console.error('Lead update error:', leadUpdateError)
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ success: false, message: 'Failed to claim lead' })
      }
    }

    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        contractor_id,
        amount: -10.00,
        source: 'purchase',
        notes: `Lead purchase: ${claimToken.leads.service_category} / ${claimToken.leads.zip_code}`
      })

    if (transactionError) {
      console.error('Transaction insertion error:', transactionError)
    }

    const { error: tokenDeleteError } = await supabase
      .from('claim_tokens')
      .delete()
      .eq('token', token)

    if (tokenDeleteError) {
      console.error('Token deletion error:', tokenDeleteError)
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'Lead claimed successfully!',
        lead: updatedLead
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
