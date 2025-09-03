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

    console.log('Starting lead deletion process for lead_id:', lead_id)

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

    console.log('Step 1: Deleting lead_sales records...')
    const { error: leadSalesError } = await supabase
      .from('lead_sales')
      .delete()
      .eq('lead_id', lead_id)

    if (leadSalesError) {
      console.error('Error deleting lead_sales:', leadSalesError)
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          detail: 'Failed to delete lead_sales entries',
          error: leadSalesError.message,
          step: 'lead_sales_deletion'
        })
      }
    }
    console.log('Step 1 completed: lead_sales deletion successful')

    console.log('Step 2: Deleting refund_requests records...')
    const { error: refundRequestsError } = await supabase
      .from('refund_requests')
      .delete()
      .eq('lead_id', lead_id)

    if (refundRequestsError) {
      console.error('Error deleting refund_requests:', refundRequestsError)
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          detail: 'Failed to delete refund_requests entries',
          error: refundRequestsError.message,
          step: 'refund_requests_deletion'
        })
      }
    }
    console.log('Step 2 completed: refund_requests deletion successful')

    console.log('Step 3: Deleting contractor_leads records...')
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
        body: JSON.stringify({ 
          detail: 'Failed to delete contractor_leads entries',
          error: contractorLeadsError.message,
          step: 'contractor_leads_deletion'
        })
      }
    }
    console.log('Step 3 completed: contractor_leads deletion successful')

    console.log('Step 4: Deleting transactions records...')
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
        body: JSON.stringify({ 
          detail: 'Failed to delete transaction entries',
          error: transactionsError.message,
          step: 'transactions_deletion'
        })
      }
    }
    console.log('Step 4 completed: transactions deletion successful')

    console.log('Step 5: Deleting purchased_leads records...')
    const { error: purchasedLeadsError } = await supabase
      .from('purchased_leads')
      .delete()
      .eq('lead_id', lead_id)

    if (purchasedLeadsError) {
      console.error('Error deleting purchased_leads:', purchasedLeadsError)
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          detail: 'Failed to delete purchased_leads entries',
          error: purchasedLeadsError.message,
          step: 'purchased_leads_deletion'
        })
      }
    }
    console.log('Step 5 completed: purchased_leads deletion successful')


    console.log('Step 6: Updating validation_metrics records...')
    const { error: validationMetricsError } = await supabase
      .from('validation_metrics')
      .update({ lead_id: null })
      .eq('lead_id', lead_id)

    if (validationMetricsError) {
      console.error('Error updating validation_metrics:', validationMetricsError)
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          detail: 'Failed to update validation_metrics entries',
          error: validationMetricsError.message,
          step: 'validation_metrics_update'
        })
      }
    }
    console.log('Step 6 completed: validation_metrics update successful')

    console.log('Step 7: Deleting notification_logs records...')
    const { error: notificationLogsError } = await supabase
      .from('notification_logs')
      .delete()
      .eq('lead_id', lead_id)

    if (notificationLogsError) {
      console.error('Error deleting notification_logs:', notificationLogsError)
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          detail: 'Failed to delete notification_logs entries',
          error: notificationLogsError.message,
          step: 'notification_logs_deletion'
        })
      }
    }
    console.log('Step 7 completed: notification_logs deletion successful')

    console.log('Step 8: Deleting sms_send_log records...')
    const { error: smsLogsError } = await supabase
      .from('sms_send_log')
      .delete()
      .eq('lead_id', lead_id)

    if (smsLogsError) {
      console.error('Error deleting sms_send_log:', smsLogsError)
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          detail: 'Failed to delete sms_send_log entries',
          error: smsLogsError.message,
          step: 'sms_send_log_deletion'
        })
      }
    }
    console.log('Step 8 completed: sms_send_log deletion successful')

    console.log('Step 9: Deleting claim_tokens records...')
    const { error: claimTokensError } = await supabase
      .from('claim_tokens')
      .delete()
      .eq('lead_id', lead_id)

    if (claimTokensError) {
      console.error('Error deleting claim_tokens:', claimTokensError)
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          detail: 'Failed to delete claim_tokens entries',
          error: claimTokensError.message,
          step: 'claim_tokens_deletion'
        })
      }
    }
    console.log('Step 9 completed: claim_tokens deletion successful')

    console.log('Step 10: Deleting lead_score_events records...')
    const { error: leadScoreEventsError } = await supabase
      .from('lead_score_events')
      .delete()
      .eq('lead_id', lead_id)

    if (leadScoreEventsError) {
      console.error('Error deleting lead_score_events:', leadScoreEventsError)
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          detail: 'Failed to delete lead_score_events entries',
          error: leadScoreEventsError.message,
          step: 'lead_score_events_deletion'
        })
      }
    }
    console.log('Step 10 completed: lead_score_events deletion successful')

    console.log('Step 11: Deleting contractor_notifications records...')
    const { error: contractorNotificationsError } = await supabase
      .from('contractor_notifications')
      .delete()
      .eq('lead_id', lead_id)

    if (contractorNotificationsError) {
      console.error('Error deleting contractor_notifications:', contractorNotificationsError)
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          detail: 'Failed to delete contractor_notifications entries',
          error: contractorNotificationsError.message,
          step: 'contractor_notifications_deletion'
        })
      }
    }
    console.log('Step 11 completed: contractor_notifications deletion successful')

    console.log('Step 12: Deleting the main lead record...')
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
        body: JSON.stringify({ 
          detail: 'Failed to delete lead',
          error: error.message,
          step: 'main_lead_deletion'
        })
      }
    }
    console.log('Step 12 completed: Main lead deletion successful')

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
    console.error('Unexpected error during lead deletion:', error)
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        detail: 'Internal server error',
        error: error.message,
        step: 'unexpected_error'
      })
    }
  }
}
