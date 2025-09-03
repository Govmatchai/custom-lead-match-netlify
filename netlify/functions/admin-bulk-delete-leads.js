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
        'Access-Control-Allow-Methods': 'DELETE, OPTIONS'
      }
    }
  }

  if (event.httpMethod !== 'DELETE') {
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
    const data = JSON.parse(event.body)
    const { lead_ids } = data

    if (!lead_ids || !Array.isArray(lead_ids) || lead_ids.length === 0) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ detail: 'Lead IDs array is required' })
      }
    }

    const deletePromises = lead_ids.map(async (leadId) => {
      try {
        await supabase
          .from('lead_sales')
          .delete()
          .eq('lead_id', leadId)

        await supabase
          .from('refund_requests')
          .delete()
          .eq('lead_id', leadId)

        await supabase
          .from('contractor_leads')
          .delete()
          .eq('lead_id', leadId)

        await supabase
          .from('transactions')
          .delete()
          .eq('lead_id', leadId)

        await supabase
          .from('purchased_leads')
          .delete()
          .eq('lead_id', leadId)


        await supabase
          .from('validation_metrics')
          .update({ lead_id: null })
          .eq('lead_id', leadId)

        const { error } = await supabase
          .from('leads')
          .delete()
          .eq('id', leadId)

        return { id: leadId, success: !error, error: error?.message }
      } catch (err) {
        return { id: leadId, success: false, error: err.message }
      }
    })

    const results = await Promise.all(deletePromises)
    const successful = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success)

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: `Successfully deleted ${successful} leads`,
        results: results,
        failed_deletions: failed
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
