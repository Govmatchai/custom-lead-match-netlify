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
    const { contractor_id, session_token, page = '1', limit = '25' } = event.queryStringParameters || {}

    if (!contractor_id || !session_token) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ success: false, message: 'Contractor ID and session token are required' })
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

    const pageNum = parseInt(page) || 1
    const limitNum = parseInt(limit) || 25
    const offset = (pageNum - 1) * limitNum

    const { data: purchaseHistory, error: historyError } = await supabase
      .from('purchased_leads')
      .select(`
        id,
        lead_id,
        price_paid,
        zip_code,
        purchased_at,
        status,
        leads (
          id,
          service_category,
          sub_service,
          is_archived
        )
      `)
      .eq('contractor_id', contractor_id)
      .order('purchased_at', { ascending: false })
      .range(offset, offset + limitNum - 1)

    if (historyError) {
      console.error('Error fetching purchase history:', historyError)
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ success: false, message: 'Failed to fetch purchase history' })
      }
    }

    const { count, error: countError } = await supabase
      .from('purchased_leads')
      .select('*', { count: 'exact', head: true })
      .eq('contractor_id', contractor_id)

    if (countError) {
      console.error('Error counting purchase history:', countError)
    }

    const formattedHistory = purchaseHistory.map(purchase => ({
      id: purchase.id,
      lead_id: purchase.lead_id,
      date_purchased: purchase.purchased_at,
      industry: purchase.leads?.service_category || 'N/A',
      sub_service: purchase.leads?.sub_service || 'N/A',
      lead_zip_code: purchase.zip_code,
      purchase_price: purchase.price_paid,
      status: purchase.leads?.is_archived ? 'Archived' : 
              purchase.status === 'completed' ? 'Completed' : 'Available'
    }))

    const totalPages = Math.ceil((count || 0) / limitNum)

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        purchase_history: formattedHistory,
        pagination: {
          current_page: pageNum,
          total_pages: totalPages,
          total_records: count || 0,
          limit: limitNum
        }
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
