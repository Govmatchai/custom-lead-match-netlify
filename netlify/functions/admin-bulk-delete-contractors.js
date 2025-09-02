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
    const { contractor_ids } = JSON.parse(event.body)

    if (!contractor_ids || !Array.isArray(contractor_ids) || contractor_ids.length === 0) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ detail: 'contractor_ids array is required' })
      }
    }

    const deletePromises = contractor_ids.map(async (contractorId) => {
      try {
        const { error: claimedLeadsError } = await supabase
          .from('leads')
          .update({ claimed_by: null })
          .eq('claimed_by', contractorId)

        if (claimedLeadsError) {
          return { id: contractorId, success: false, error: `Failed to update claimed leads: ${claimedLeadsError.message}` }
        }

        try {
          const { error: purchasedLeadsError } = await supabase
            .from('leads')
            .update({ purchased_by: null })
            .eq('purchased_by', contractorId)

          if (purchasedLeadsError && !purchasedLeadsError.message.includes("Could not find the 'purchased_by' column")) {
            return { id: contractorId, success: false, error: `Failed to update purchased leads: ${purchasedLeadsError.message}` }
          }
        } catch (err) {
          if (!err.message.includes("purchased_by")) {
            return { id: contractorId, success: false, error: `Failed to update purchased leads: ${err.message}` }
          }
        }

        const { error: dynamicPagesError } = await supabase
          .from('dynamic_pages')
          .update({ contractor_id: null })
          .eq('contractor_id', contractorId)

        if (dynamicPagesError) {
          return { id: contractorId, success: false, error: `Failed to update dynamic pages: ${dynamicPagesError.message}` }
        }

        const { error: transactionsError } = await supabase
          .from('transactions')
          .delete()
          .eq('contractor_id', contractorId)

        if (transactionsError) {
          return { id: contractorId, success: false, error: `Failed to delete transactions: ${transactionsError.message}` }
        }

        const { error: purchasedLeadsError } = await supabase
          .from('purchased_leads')
          .delete()
          .eq('contractor_id', contractorId)

        if (purchasedLeadsError) {
          return { id: contractorId, success: false, error: `Failed to delete purchased leads: ${purchasedLeadsError.message}` }
        }

        const { error: contractorLeadsError } = await supabase
          .from('contractor_leads')
          .delete()
          .eq('contractor_id', contractorId)

        if (contractorLeadsError) {
          return { id: contractorId, success: false, error: `Failed to delete contractor leads: ${contractorLeadsError.message}` }
        }

        try {
          await supabase.from('notification_logs').delete().eq('contractor_id', parseInt(contractorId.replace(/-/g, '').substring(0, 8), 16))
        } catch (err) { /* ignore */ }
        
        try {
          await supabase.from('contractor_activity_log').delete().eq('contractor_id', contractorId)
        } catch (err) { /* ignore */ }
        
        try {
          await supabase.from('sms_send_log').delete().eq('contractor_id', contractorId)
        } catch (err) { /* ignore */ }
        
        try {
          await supabase.from('lead_sales').delete().eq('contractor_id', contractorId)
        } catch (err) { /* ignore */ }
        
        try {
          await supabase.from('contractor_notifications').delete().eq('contractor_id', contractorId)
        } catch (err) { /* ignore */ }

        const { error } = await supabase
          .from('contractors')
          .delete()
          .eq('id', contractorId)

        return { id: contractorId, success: !error, error: error?.message }
      } catch (err) {
        return { id: contractorId, success: false, error: err.message }
      }
    })

    const results = await Promise.all(deletePromises)
    const successful = results.filter(r => r.success)
    const failed = results.filter(r => !r.success)

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: `Deleted ${successful.length} contractors, ${failed.length} failed`,
        successful: successful.map(r => r.id),
        failed: failed.map(r => ({ id: r.id, error: r.error }))
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
