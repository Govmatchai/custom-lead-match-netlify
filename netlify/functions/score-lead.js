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
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ detail: 'Method not allowed' })
    }
  }

  try {
    const { lead_id, lead_data } = JSON.parse(event.body)
    
    if (!lead_id && !lead_data) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ detail: 'lead_id or lead_data required' })
      }
    }

    let lead = lead_data
    if (lead_id && !lead_data) {
      const { data: leadData, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', lead_id)
        .single()
      
      if (error || !leadData) {
        return {
          statusCode: 404,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({ detail: 'Lead not found' })
        }
      }
      lead = leadData
    }

    const score = await calculateLeadScore(lead)
    const band = getScoreBand(score.score)
    
    if (lead_id) {
      await supabase
        .from('leads')
        .update({
          lead_score: score.score,
          lead_score_band: band,
          lead_score_reason: score.reason,
          lead_score_updated_at: new Date().toISOString()
        })
        .eq('id', lead_id)

      await supabase
        .from('lead_score_events')
        .insert({
          lead_id,
          score: score.score,
          band,
          reason: score.reason
        })
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        score: score.score,
        band,
        reason: score.reason
      })
    }
  } catch (error) {
    console.error('Scoring error:', error)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ detail: 'Internal server error' })
    }
  }
}

async function calculateLeadScore(lead) {
  let score = 0
  const reasons = []

  const validationFlags = lead.validation_flags || {}
  if (validationFlags.phone_valid && validationFlags.email_format_valid) {
    score += 40
    reasons.push("Valid phone & email")
  } else if (!validationFlags.phone_valid || !validationFlags.email_format_valid) {
    score -= 30
    reasons.push("Invalid contact info")
  }

  score += 20
  reasons.push("In-area zip")

  const highConversionCategories = ['Home Services', 'Legal']
  if (highConversionCategories.includes(lead.service_category)) {
    score += 15
    reasons.push("High-conversion category")
  }

  if (lead.email && (lead.email.includes('tempmail') || lead.email.includes('10minutemail'))) {
    score -= 10
    reasons.push("Disposable email detected")
  }

  if (validationFlags.is_duplicate) {
    score -= 15
    reasons.push("Duplicate risk detected")
  }

  const submissionHour = new Date(lead.created_at).getHours()
  if (submissionHour >= 9 && submissionHour <= 17) {
    score += 10
    reasons.push("Business hours submission")
  }

  score = Math.max(0, Math.min(100, score))

  return {
    score,
    reason: reasons.slice(0, 2).join("; ")
  }
}

function getScoreBand(score) {
  if (score >= 80) return 'A'
  if (score >= 60) return 'B'
  return 'C'
}
