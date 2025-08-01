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

    const { data: transactions, error: balanceError } = await supabase
      .from('transactions')
      .select('amount')
      .eq('contractor_id', contractor_id)

    if (balanceError) {
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

    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', lead_id)
      .eq('claimed', false)
      .eq('is_archived', false)
      .eq('status', 'valid')
      .single()

    if (leadError || !lead) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ success: false, message: 'Lead not available or already claimed' })
      }
    }

    const { data: categoryPricing, error: pricingError } = await supabase
      .from('category_pricing')
      .select('price')
      .eq('category', lead.service_category)
      .single()

    const leadPrice = categoryPricing ? parseFloat(categoryPricing.price) : 20.00

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

    const { data: updatedLead, error: leadUpdateError } = await supabase
      .from('leads')
      .update({
        claimed: true,
        claimed_by: contractor_id,
        claimed_at: new Date().toISOString(),
        is_archived: true
      })
      .eq('id', lead_id)
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
        body: JSON.stringify({ 
          success: false, 
          message: 'Failed to purchase lead',
          error: leadUpdateError.message 
        })
      }
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
        amount_paid: leadPrice
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
