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
    const { contractor_id, days = 30 } = event.queryStringParameters || {}

    if (!contractor_id) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ detail: 'contractor_id is required' })
      }
    }

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(days))

    const { data: contractorLeads, error: leadsError } = await supabase
      .from('contractor_leads')
      .select(`
        status,
        purchased_at,
        contacted_at,
        booked_at,
        completed_at,
        price_paid,
        job_value,
        response_time_minutes
      `)
      .eq('contractor_id', contractor_id)
      .gte('purchased_at', startDate.toISOString())

    if (leadsError) {
      console.error('Error fetching contractor leads:', leadsError)
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ detail: 'Failed to fetch contractor leads' })
      }
    }

    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('amount, source, created_at')
      .eq('contractor_id', contractor_id)
      .gte('created_at', startDate.toISOString())

    if (transactionsError) {
      console.error('Error fetching transactions:', transactionsError)
    }

    const metrics = {
      leads_purchased: contractorLeads.filter(lead => lead.status === 'purchased' || lead.purchased_at).length,
      leads_contacted: contractorLeads.filter(lead => lead.contacted_at).length,
      leads_booked: contractorLeads.filter(lead => lead.booked_at).length,
      leads_completed: contractorLeads.filter(lead => lead.completed_at).length,
      total_spend: contractorLeads.reduce((sum, lead) => sum + (lead.price_paid || 0), 0),
      total_revenue: contractorLeads.reduce((sum, lead) => sum + (lead.job_value || 0), 0),
      avg_response_time: 0,
      close_rate: 0,
      roi_ratio: 0,
      wallet_funding: transactions ? transactions.filter(t => t.source === 'stripe').reduce((sum, t) => sum + t.amount, 0) : 0
    }

    const responseTimes = contractorLeads
      .filter(lead => lead.response_time_minutes !== null)
      .map(lead => lead.response_time_minutes)

    if (responseTimes.length > 0) {
      metrics.avg_response_time = Math.round(responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length)
    }

    if (metrics.leads_purchased > 0) {
      metrics.close_rate = Math.round((metrics.leads_completed / metrics.leads_purchased) * 100)
    }

    if (metrics.total_spend > 0) {
      metrics.roi_ratio = parseFloat((metrics.total_revenue / metrics.total_spend).toFixed(2))
    }

    const dailyData = []
    for (let i = parseInt(days) - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]

      const dayLeads = contractorLeads.filter(lead => {
        if (!lead.purchased_at) return false
        const leadDate = new Date(lead.purchased_at).toISOString().split('T')[0]
        return leadDate === dateStr
      })

      const dayTransactions = transactions ? transactions.filter(t => {
        const transactionDate = new Date(t.created_at).toISOString().split('T')[0]
        return transactionDate === dateStr
      }) : []

      dailyData.push({
        date: dateStr,
        leads_purchased: dayLeads.length,
        leads_booked: dayLeads.filter(lead => lead.booked_at).length,
        spend: dayLeads.reduce((sum, lead) => sum + (lead.price_paid || 0), 0),
        revenue: dayLeads.reduce((sum, lead) => sum + (lead.job_value || 0), 0),
        wallet_funding: dayTransactions.filter(t => t.source === 'stripe').reduce((sum, t) => sum + t.amount, 0)
      })
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        contractor_id,
        period_days: parseInt(days),
        metrics,
        daily_data: dailyData
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
