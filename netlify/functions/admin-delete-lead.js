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
    const { lead_id } = data

    if (!lead_id) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ detail: 'Lead ID is required' })
      }
    }

    const { error: contractorLeadsError } = await supabase
      .from('contractor_leads')
      .delete()
      .eq('lead_id', lead_id)

    if (contractorLeadsError) {
      console.error('Error deleting contractor_leads:', contractorLeadsError)
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ detail: 'Failed to delete contractor_leads entries' })
      }
    }

    const { error: transactionsError } = await supabase
      .from('transactions')
      .delete()
      .eq('lead_id', lead_id)

    if (transactionsError) {
      console.error('Error deleting transactions:', transactionsError)
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ detail: 'Failed to delete transaction entries' })
      }
    }

    const { error: purchasedLeadsError } = await supabase
      .from('purchased_leads')
      .delete()
      .eq('lead_id', lead_id)

    if (purchasedLeadsError) {
      console.error('Error deleting purchased_leads:', purchasedLeadsError)
    }

    const { error: notificationLogsError } = await supabase
      .from('notification_logs')
      .delete()
      .eq('lead_id', parseInt(lead_id))

    if (notificationLogsError) {
      console.error('Error deleting notification_logs:', notificationLogsError)
    }

    const { error: validationMetricsError } = await supabase
      .from('validation_metrics')
      .update({ lead_id: null })
      .eq('lead_id', lead_id)

    if (validationMetricsError) {
      console.error('Error updating validation_metrics:', validationMetricsError)
    }

    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', lead_id)

    if (error) {
      console.error('Database delete error:', error)
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ detail: 'Failed to delete lead' })
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'Lead deleted successfully'
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
