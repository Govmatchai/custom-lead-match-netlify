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
    try {
      const { error: leadSalesError } = await supabase
        .from('lead_sales')
        .delete()
        .eq('lead_id', lead_id)

      if (leadSalesError) {
        if (leadSalesError.message.includes('does not exist') || leadSalesError.message.includes('relation') && leadSalesError.message.includes('does not exist')) {
          console.log('Step 1 skipped: lead_sales table does not exist in production')
        } else {
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
      } else {
        console.log('Step 1 completed: lead_sales deletion successful')
      }
    } catch (error) {
      if (error.message && (error.message.includes('does not exist') || (error.message.includes('relation') && error.message.includes('does not exist')))) {
        console.log('Step 1 skipped: lead_sales table does not exist in production')
      } else {
        console.error('Unexpected error in lead_sales deletion:', error)
        return {
          statusCode: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ 
            detail: 'Failed to delete lead_sales entries',
            error: error.message,
            step: 'lead_sales_deletion'
          })
        }
      }
    }

    console.log('Step 2: Deleting refund_requests records...')
    try {
      const { error: refundRequestsError } = await supabase
        .from('refund_requests')
        .delete()
        .eq('lead_id', lead_id)

      if (refundRequestsError) {
        if (refundRequestsError.message.includes('does not exist') || (refundRequestsError.message.includes('relation') && refundRequestsError.message.includes('does not exist'))) {
          console.log('Step 2 skipped: refund_requests table does not exist in production')
        } else {
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
      } else {
        console.log('Step 2 completed: refund_requests deletion successful')
      }
    } catch (error) {
      if (error.message && (error.message.includes('does not exist') || (error.message.includes('relation') && error.message.includes('does not exist')))) {
        console.log('Step 2 skipped: refund_requests table does not exist in production')
      } else {
        console.error('Unexpected error in refund_requests deletion:', error)
        return {
          statusCode: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ 
            detail: 'Failed to delete refund_requests entries',
            error: error.message,
            step: 'refund_requests_deletion'
          })
        }
      }
    }

    console.log('Step 3: Deleting contractor_leads records...')
    try {
      const { error: contractorLeadsError } = await supabase
        .from('contractor_leads')
        .delete()
        .eq('lead_id', lead_id)

      if (contractorLeadsError) {
        if (contractorLeadsError.message.includes('does not exist') || (contractorLeadsError.message.includes('relation') && contractorLeadsError.message.includes('does not exist'))) {
          console.log('Step 3 skipped: contractor_leads table does not exist in production')
        } else {
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
      } else {
        console.log('Step 3 completed: contractor_leads deletion successful')
      }
    } catch (error) {
      if (error.message && (error.message.includes('does not exist') || (error.message.includes('relation') && error.message.includes('does not exist')))) {
        console.log('Step 3 skipped: contractor_leads table does not exist in production')
      } else {
        console.error('Unexpected error in contractor_leads deletion:', error)
        return {
          statusCode: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ 
            detail: 'Failed to delete contractor_leads entries',
            error: error.message,
            step: 'contractor_leads_deletion'
          })
        }
      }
    }

    console.log('Step 4: Deleting transactions records...')
    try {
      const { error: transactionsError } = await supabase
        .from('transactions')
        .delete()
        .eq('lead_id', lead_id)

      if (transactionsError) {
        if (transactionsError.message.includes('does not exist') || (transactionsError.message.includes('relation') && transactionsError.message.includes('does not exist'))) {
          console.log('Step 4 skipped: transactions table does not exist in production')
        } else {
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
      } else {
        console.log('Step 4 completed: transactions deletion successful')
      }
    } catch (error) {
      if (error.message && (error.message.includes('does not exist') || (error.message.includes('relation') && error.message.includes('does not exist')))) {
        console.log('Step 4 skipped: transactions table does not exist in production')
      } else {
        console.error('Unexpected error in transactions deletion:', error)
        return {
          statusCode: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ 
            detail: 'Failed to delete transaction entries',
            error: error.message,
            step: 'transactions_deletion'
          })
        }
      }
    }

    console.log('Step 5: Deleting purchased_leads records...')
    try {
      const { error: purchasedLeadsError } = await supabase
        .from('purchased_leads')
        .delete()
        .eq('lead_id', lead_id)

      if (purchasedLeadsError) {
        if (purchasedLeadsError.message.includes('does not exist') || (purchasedLeadsError.message.includes('relation') && purchasedLeadsError.message.includes('does not exist'))) {
          console.log('Step 5 skipped: purchased_leads table does not exist in production')
        } else {
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
      } else {
        console.log('Step 5 completed: purchased_leads deletion successful')
      }
    } catch (error) {
      if (error.message && (error.message.includes('does not exist') || (error.message.includes('relation') && error.message.includes('does not exist')))) {
        console.log('Step 5 skipped: purchased_leads table does not exist in production')
      } else {
        console.error('Unexpected error in purchased_leads deletion:', error)
        return {
          statusCode: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ 
            detail: 'Failed to delete purchased_leads entries',
            error: error.message,
            step: 'purchased_leads_deletion'
          })
        }
      }
    }


    console.log('Step 6: Updating validation_metrics records...')
    try {
      const { error: validationMetricsError } = await supabase
        .from('validation_metrics')
        .update({ lead_id: null })
        .eq('lead_id', lead_id)

      if (validationMetricsError) {
        if (validationMetricsError.message.includes('does not exist') || (validationMetricsError.message.includes('relation') && validationMetricsError.message.includes('does not exist'))) {
          console.log('Step 6 skipped: validation_metrics table does not exist in production')
        } else {
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
      } else {
        console.log('Step 6 completed: validation_metrics update successful')
      }
    } catch (error) {
      if (error.message && (error.message.includes('does not exist') || (error.message.includes('relation') && error.message.includes('does not exist')))) {
        console.log('Step 6 skipped: validation_metrics table does not exist in production')
      } else {
        console.error('Unexpected error in validation_metrics update:', error)
        return {
          statusCode: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ 
            detail: 'Failed to update validation_metrics entries',
            error: error.message,
            step: 'validation_metrics_update'
          })
        }
      }
    }

    console.log('Step 7: Deleting notification_logs records...')
    try {
      const { error: notificationLogsError } = await supabase
        .from('notification_logs')
        .delete()
        .eq('lead_id', lead_id)

      if (notificationLogsError) {
        if (notificationLogsError.message.includes('does not exist') || (notificationLogsError.message.includes('relation') && notificationLogsError.message.includes('does not exist'))) {
          console.log('Step 7 skipped: notification_logs table does not exist in production')
        } else {
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
      } else {
        console.log('Step 7 completed: notification_logs deletion successful')
      }
    } catch (error) {
      if (error.message && (error.message.includes('does not exist') || (error.message.includes('relation') && error.message.includes('does not exist')))) {
        console.log('Step 7 skipped: notification_logs table does not exist in production')
      } else {
        console.error('Unexpected error in notification_logs deletion:', error)
        return {
          statusCode: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ 
            detail: 'Failed to delete notification_logs entries',
            error: error.message,
            step: 'notification_logs_deletion'
          })
        }
      }
    }

    console.log('Step 8: Deleting sms_send_log records...')
    try {
      const { error: smsLogsError } = await supabase
        .from('sms_send_log')
        .delete()
        .eq('lead_id', lead_id)

      if (smsLogsError) {
        if (smsLogsError.message.includes('does not exist') || (smsLogsError.message.includes('relation') && smsLogsError.message.includes('does not exist'))) {
          console.log('Step 8 skipped: sms_send_log table does not exist in production')
        } else {
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
      } else {
        console.log('Step 8 completed: sms_send_log deletion successful')
      }
    } catch (error) {
      if (error.message && (error.message.includes('does not exist') || (error.message.includes('relation') && error.message.includes('does not exist')))) {
        console.log('Step 8 skipped: sms_send_log table does not exist in production')
      } else {
        console.error('Unexpected error in sms_send_log deletion:', error)
        return {
          statusCode: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ 
            detail: 'Failed to delete sms_send_log entries',
            error: error.message,
            step: 'sms_send_log_deletion'
          })
        }
      }
    }

    console.log('Step 9: Deleting claim_tokens records...')
    try {
      const { error: claimTokensError } = await supabase
        .from('claim_tokens')
        .delete()
        .eq('lead_id', lead_id)

      if (claimTokensError) {
        if (claimTokensError.message.includes('does not exist') || (claimTokensError.message.includes('relation') && claimTokensError.message.includes('does not exist'))) {
          console.log('Step 9 skipped: claim_tokens table does not exist in production')
        } else {
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
      } else {
        console.log('Step 9 completed: claim_tokens deletion successful')
      }
    } catch (error) {
      if (error.message && (error.message.includes('does not exist') || (error.message.includes('relation') && error.message.includes('does not exist')))) {
        console.log('Step 9 skipped: claim_tokens table does not exist in production')
      } else {
        console.error('Unexpected error in claim_tokens deletion:', error)
        return {
          statusCode: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ 
            detail: 'Failed to delete claim_tokens entries',
            error: error.message,
            step: 'claim_tokens_deletion'
          })
        }
      }
    }

    console.log('Step 10: Deleting lead_score_events records...')
    try {
      const { error: leadScoreEventsError } = await supabase
        .from('lead_score_events')
        .delete()
        .eq('lead_id', lead_id)

      if (leadScoreEventsError) {
        if (leadScoreEventsError.message.includes('does not exist') || (leadScoreEventsError.message.includes('relation') && leadScoreEventsError.message.includes('does not exist'))) {
          console.log('Step 10 skipped: lead_score_events table does not exist in production')
        } else {
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
      } else {
        console.log('Step 10 completed: lead_score_events deletion successful')
      }
    } catch (error) {
      if (error.message && (error.message.includes('does not exist') || (error.message.includes('relation') && error.message.includes('does not exist')))) {
        console.log('Step 10 skipped: lead_score_events table does not exist in production')
      } else {
        console.error('Unexpected error in lead_score_events deletion:', error)
        return {
          statusCode: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ 
            detail: 'Failed to delete lead_score_events entries',
            error: error.message,
            step: 'lead_score_events_deletion'
          })
        }
      }
    }

    console.log('Step 11: Deleting contractor_notifications records...')
    try {
      const { error: contractorNotificationsError } = await supabase
        .from('contractor_notifications')
        .delete()
        .eq('lead_id', lead_id)

      if (contractorNotificationsError) {
        if (contractorNotificationsError.message.includes('does not exist') || (contractorNotificationsError.message.includes('relation') && contractorNotificationsError.message.includes('does not exist'))) {
          console.log('Step 11 skipped: contractor_notifications table does not exist in production')
        } else {
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
      } else {
        console.log('Step 11 completed: contractor_notifications deletion successful')
      }
    } catch (error) {
      if (error.message && (error.message.includes('does not exist') || (error.message.includes('relation') && error.message.includes('does not exist')))) {
        console.log('Step 11 skipped: contractor_notifications table does not exist in production')
      } else {
        console.error('Unexpected error in contractor_notifications deletion:', error)
        return {
          statusCode: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ 
            detail: 'Failed to delete contractor_notifications entries',
            error: error.message,
            step: 'contractor_notifications_deletion'
          })
        }
      }
    }

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
