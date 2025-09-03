import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '../../.env' })

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

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
    const { contractor_id, limit = 12 } = event.queryStringParameters || {}

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

    const { data: reports, error } = await supabase
      .from('weekly_reports')
      .select('*')
      .eq('contractor_id', contractor_id)
      .order('week_start', { ascending: false })
      .limit(parseInt(limit))

    if (error) {
      console.error('Error fetching weekly reports:', error)
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ detail: 'Failed to fetch weekly reports' })
      }
    }

    const formattedReports = reports.map(report => ({
      ...report,
      week_start_formatted: new Date(report.week_start).toLocaleDateString(),
      week_end_formatted: new Date(report.week_end).toLocaleDateString(),
      spend: parseFloat(report.spend),
      refunds: parseFloat(report.refunds),
      wallet_balance: parseFloat(report.wallet_balance)
    }))

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        reports: formattedReports
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
