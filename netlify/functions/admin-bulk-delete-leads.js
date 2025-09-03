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
        const tablesToDelete = [
          'lead_sales',
          'refund_requests', 
          'contractor_leads',
          'transactions',
          'purchased_leads',
          'notification_logs',
          'sms_send_log',
          'claim_tokens',
          'lead_score_events',
          'contractor_notifications'
        ]

        for (const tableName of tablesToDelete) {
          try {
            const { error } = await supabase
              .from(tableName)
              .delete()
              .eq('lead_id', leadId)
            
            if (error && !(error.message.includes('does not exist') || (error.message.includes('relation') && error.message.includes('does not exist')))) {
              console.error(`Error deleting from ${tableName}:`, error)
            }
          } catch (tableError) {
            if (!tableError.message || !(tableError.message.includes('does not exist') || (tableError.message.includes('relation') && tableError.message.includes('does not exist')))) {
              console.error(`Unexpected error deleting from ${tableName}:`, tableError)
            }
          }
        }

        try {
          const { error: validationError } = await supabase
            .from('validation_metrics')
            .update({ lead_id: null })
            .eq('lead_id', leadId)
          
          if (validationError && !(validationError.message.includes('does not exist') || (validationError.message.includes('relation') && validationError.message.includes('does not exist')))) {
            console.error('Error updating validation_metrics:', validationError)
          }
        } catch (validationTableError) {
          if (!validationTableError.message || !(validationTableError.message.includes('does not exist') || (validationTableError.message.includes('relation') && validationTableError.message.includes('does not exist')))) {
            console.error('Unexpected error updating validation_metrics:', validationTableError)
          }
        }

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
