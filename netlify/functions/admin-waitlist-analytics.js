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
    const { data: waitlistEntries, error: waitlistError } = await supabase
      .from('contractors_waitlist')
      .select('*')

    if (waitlistError) {
      console.error('Error fetching waitlist:', waitlistError)
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Failed to fetch waitlist data' })
      }
    }

    const totalWaitlist = waitlistEntries?.length || 0
    const notifiedCount = waitlistEntries?.filter(entry => entry.launch_notified).length || 0
    const pendingCount = totalWaitlist - notifiedCount

    const tradeBreakdown = {}
    waitlistEntries?.forEach(entry => {
      tradeBreakdown[entry.trade] = (tradeBreakdown[entry.trade] || 0) + 1
    })

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const recentSignups = waitlistEntries?.filter(entry => 
      new Date(entry.created_at) >= sevenDaysAgo
    ).length || 0

    const { data: pageViews, error: analyticsError } = await supabase
      .from('page_analytics')
      .select('*')
      .eq('page_path', '/launch-soon')

    const totalPageViews = pageViews?.reduce((sum, view) => sum + (view.view_count || 0), 0) || 0

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        totalWaitlist,
        notifiedCount,
        pendingCount,
        recentSignups,
        totalPageViews,
        tradeBreakdown: Object.entries(tradeBreakdown).map(([trade, count]) => ({ trade, count })),
        waitlistEntries: waitlistEntries || []
      })
    }
  } catch (error) {
    console.error('Waitlist analytics error:', error)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message })
    }
  }
}
