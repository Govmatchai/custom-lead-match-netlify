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
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
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
    const { lead_id, contractor_id, session_token } = data

    if (!lead_id || !contractor_id || !session_token) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ success: false, message: 'Lead ID, contractor ID, and session token are required' })
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

    const { data: contractor, error: contractorError } = await supabase
      .from('contractors')
      .select('wallet_balance')
      .eq('id', contractor_id)
      .single()

    if (contractorError || !contractor) {
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ success: false, message: 'Failed to check contractor balance' })
      }
    }

    const currentBalance = contractor.wallet_balance || 0

    const { data: contractorLead, error: contractorLeadError } = await supabase
      .from('contractor_leads')
      .select(`
        id,
        status,
        leads (
          id,
          service_category,
          zip_code,
          customer_name,
          phone,
          email,
          description
        )
      `)
      .eq('contractor_id', contractor_id)
      .eq('lead_id', lead_id)
      .eq('status', 'available')
      .single()

    if (contractorLeadError || !contractorLead) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ success: false, message: 'Lead not available or already claimed' })
      }
    }

    const lead = contractorLead.leads

    const leadPrice = parseFloat(lead.price) || 20.00

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

    const { data: existingPurchase, error: purchaseCheckError } = await supabase
      .from('purchased_leads')
      .select('id')
      .eq('contractor_id', contractor_id)
      .eq('lead_id', lead_id)
      .single()

    if (existingPurchase) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ success: false, message: 'You have already purchased this lead' })
      }
    }

    const { error: updatePurchasedError } = await supabase
      .from('contractor_leads')
      .update({ 
        status: 'purchased',
        purchased_at: new Date().toISOString(),
        price_paid: leadPrice
      })
      .eq('contractor_id', contractor_id)
      .eq('lead_id', lead_id)
      .eq('status', 'available')

    if (updatePurchasedError) {
      console.error('Update contractor_leads error:', updatePurchasedError)
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ success: false, message: 'Failed to update contractor_leads for purchase' })
      }
    }

    const { error: expireOthersError } = await supabase
      .from('contractor_leads')
      .update({ status: 'expired' })
      .eq('lead_id', lead_id)
      .neq('contractor_id', contractor_id)
      .eq('status', 'available')

    if (expireOthersError) {
      console.error('Failed to expire other contractors entries:', expireOthersError)
    }

    const { data: updatedLead, error: leadUpdateError } = await supabase
      .from('leads')
      .update({
        claimed: true,
        claimed_by: contractor_id,
        claimed_at: new Date().toISOString(),
        purchased_by: contractor_id,
        purchased_at: new Date().toISOString(),
        status: 'purchased',
        is_archived: true
      })
      .eq('id', lead_id)
      .select()
      .single()

    if (leadUpdateError) {
      console.error('Lead update error:', leadUpdateError)
    }

    const { error: walletUpdateError } = await supabase
      .from('contractors')
      .update({
        wallet_balance: currentBalance - leadPrice
      })
      .eq('id', contractor_id)

    if (walletUpdateError) {
      console.error('Wallet balance update error:', walletUpdateError)
    }

    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        contractor_id,
        amount: -leadPrice,
        source: 'purchase',
        notes: `Lead purchase: ${lead.service_category} / ${lead.zip_code}`
      })

    if (transactionError) {
      console.error('Transaction insertion error:', transactionError)
    }

    const { error: purchasedLeadError } = await supabase
      .from('purchased_leads')
      .insert({
        contractor_id,
        lead_id,
        price_paid: leadPrice,
        zip_code: lead.zip_code,
        status: 'active'
      })

    if (purchasedLeadError) {
      console.error('Purchased lead insertion error:', purchasedLeadError)
    }

    const { error: leadSalesError } = await supabase
      .from('lead_sales')
      .insert({
        contractor_id,
        lead_id,
        amount: leadPrice
      })

    if (leadSalesError) {
      console.error('Lead sales insertion error:', leadSalesError)
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'Lead purchased successfully!',
        lead: updatedLead,
        new_wallet_balance: currentBalance - leadPrice
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
