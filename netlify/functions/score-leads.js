import { createClient } from '@supabase/supabase-js'
import { handler as scoreLeadHandler } from './score-lead.js'
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
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    
    const { data: leadsToScore, error } = await supabase
      .from('leads')
      .select('*')
      .or(`lead_score.is.null,lead_score_reason.is.null,lead_score_updated_at.lt.${twentyFourHoursAgo}`)
      .eq('status', 'valid')
      .limit(100)

    if (error) {
      console.error('Query error:', error)
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ detail: 'Database query failed' })
      }
    }

    let scoredCount = 0
    let errorCount = 0

    for (const lead of leadsToScore || []) {
      try {
        const mockEvent = {
          httpMethod: 'POST',
          body: JSON.stringify({ lead_id: lead.id })
        }
        
        const result = await scoreLeadHandler(mockEvent, context)
        if (result.statusCode === 200) {
          scoredCount++
        } else {
          errorCount++
        }
      } catch (error) {
        console.error(`Error scoring lead ${lead.id}:`, error)
        errorCount++
      }
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        message: `Bulk scoring completed`,
        leads_processed: leadsToScore?.length || 0,
        leads_scored: scoredCount,
        errors: errorCount
      })
    }
  } catch (error) {
    console.error('Bulk scoring error:', error)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ detail: 'Internal server error' })
    }
  }
}
