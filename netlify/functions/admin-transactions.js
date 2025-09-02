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
      body: JSON.stringify({ detail: 'Method not allowed' })
    }
  }

  try {
    const { data: walletTransactions, error: walletError } = await supabase
      .from('transactions')
      .select(`
        id,
        contractor_id,
        amount,
        source,
        notes,
        created_at,
        contractors (business_name, contact_name)
      `)
      .order('created_at', { ascending: false })

    const { data: leadTransactions, error: leadError } = await supabase
      .from('contractor_leads')
      .select(`
        id,
        contractor_id,
        price_paid,
        purchased_at,
        contractors (business_name, contact_name),
        leads (customer_name, service_category, sub_service)
      `)
      .eq('status', 'purchased')
      .order('purchased_at', { ascending: false })

    if (walletError || leadError) {
      console.error('Transactions query error:', walletError || leadError)
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ detail: 'Failed to fetch transactions' })
      }
    }

    const allTransactions = [
      ...(walletTransactions || []).map(t => ({
        id: t.id,
        type: 'wallet_funding',
        contractor_id: t.contractor_id,
        amount: t.amount,
        description: t.source === 'stripe' ? 'Wallet Funding (Stripe)' : t.notes || 'Wallet Adjustment',
        date: t.created_at,
        contractors: t.contractors
      })),
      ...(leadTransactions || []).map(t => ({
        id: t.id,
        type: 'lead_purchase',
        contractor_id: t.contractor_id,
        amount: t.price_paid,
        description: `Lead Purchase: ${t.leads?.customer_name} - ${t.leads?.service_category}`,
        date: t.purchased_at,
        contractors: t.contractors,
        leads: t.leads
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    const totalRevenue = allTransactions
      .filter(t => t.type === 'lead_purchase')
      .reduce((sum, transaction) => sum + parseFloat(transaction.amount || 0), 0)

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        transactions: allTransactions || [],
        total_revenue: totalRevenue.toFixed(2)
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
