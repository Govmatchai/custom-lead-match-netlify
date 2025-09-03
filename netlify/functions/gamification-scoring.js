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
    const { contractor_id } = event.queryStringParameters || {}

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

    const { data: contractorLeads, error: leadsError } = await supabase
      .from('contractor_leads')
      .select('response_time_minutes, purchased_at, job_value, price_paid, status')
      .eq('contractor_id', contractor_id)
      .not('purchased_at', 'is', null)

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

    let responseTimeScore = 0
    let topPerformerBadge = false
    let currentStreak = 0
    let bestStreak = 0
    let totalROI = 0

    const responseTimes = contractorLeads
      .filter(lead => lead.response_time_minutes !== null)
      .map(lead => lead.response_time_minutes)

    if (responseTimes.length > 0) {
      const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      responseTimeScore = avgResponseTime <= 5 ? 100 : Math.max(0, 100 - Math.floor((avgResponseTime - 5) * 10))
    }

    const completedLeads = contractorLeads.filter(lead => lead.status === 'completed' && lead.job_value)
    const totalSpend = contractorLeads.reduce((sum, lead) => sum + (lead.price_paid || 0), 0)
    const totalRevenue = completedLeads.reduce((sum, lead) => sum + (lead.job_value || 0), 0)

    if (totalSpend > 0) {
      totalROI = totalRevenue / totalSpend
      topPerformerBadge = totalROI >= 4.0 && contractorLeads.length >= 20
    }

    const today = new Date()
    const purchaseDates = contractorLeads
      .map(lead => new Date(lead.purchased_at).toDateString())
      .sort((a, b) => new Date(b) - new Date(a))

    const uniqueDates = [...new Set(purchaseDates)]
    
    for (let i = 0; i < uniqueDates.length; i++) {
      const date = new Date(uniqueDates[i])
      const expectedDate = new Date(today)
      expectedDate.setDate(today.getDate() - i)
      
      if (date.toDateString() === expectedDate.toDateString()) {
        currentStreak++
      } else {
        break
      }
    }

    let tempStreak = 0
    let maxStreak = 0
    let lastDate = null

    for (const dateStr of uniqueDates) {
      const date = new Date(dateStr)
      
      if (lastDate === null) {
        tempStreak = 1
      } else {
        const dayDiff = Math.floor((lastDate - date) / (1000 * 60 * 60 * 24))
        if (dayDiff === 1) {
          tempStreak++
        } else {
          maxStreak = Math.max(maxStreak, tempStreak)
          tempStreak = 1
        }
      }
      
      lastDate = date
    }
    bestStreak = Math.max(maxStreak, tempStreak)

    const { error: updateError } = await supabase
      .from('contractors')
      .update({
        response_time_score: responseTimeScore,
        top_performer_badge: topPerformerBadge,
        current_streak: currentStreak,
        best_streak: bestStreak,
        total_roi: totalROI
      })
      .eq('id', contractor_id)

    if (updateError) {
      console.error('Error updating gamification scores:', updateError)
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        contractor_id,
        gamification: {
          response_time_score: responseTimeScore,
          top_performer_badge: topPerformerBadge,
          current_streak: currentStreak,
          best_streak: bestStreak,
          total_roi: parseFloat(totalROI.toFixed(2)),
          avg_response_time: responseTimes.length > 0 ? Math.round(responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length) : 0,
          total_leads: contractorLeads.length,
          completed_leads: completedLeads.length
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
      body: JSON.stringify({ detail: 'Internal server error' })
    }
  }
}
