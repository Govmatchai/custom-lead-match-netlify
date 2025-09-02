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

  try {
    if (event.httpMethod === 'GET') {
      const { data: refundRequests, error } = await supabase
        .from('refund_requests')
        .select(`
          *,
          contractors (
            business_name,
            email
          ),
          leads (
            customer_name,
            service_category,
            zip_code
          )
        `)
        .order('requested_at', { ascending: false })

      if (error) {
        console.error('Error fetching refund requests:', error)
        return {
          statusCode: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ detail: 'Failed to fetch refund requests' })
        }
      }

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(refundRequests)
      }
    }

    if (event.httpMethod === 'POST') {
      const { refund_request_id, action, admin_notes } = JSON.parse(event.body)

      if (!refund_request_id || !action) {
        return {
          statusCode: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ detail: 'refund_request_id and action are required' })
        }
      }

      if (!['approve', 'reject'].includes(action)) {
        return {
          statusCode: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ detail: 'action must be approve or reject' })
        }
      }

      const { data: refundRequest, error: fetchError } = await supabase
        .from('refund_requests')
        .select('*')
        .eq('id', refund_request_id)
        .single()

      if (fetchError || !refundRequest) {
        return {
          statusCode: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ detail: 'Refund request not found' })
        }
      }

      if (refundRequest.status !== 'pending') {
        return {
          statusCode: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ detail: 'Refund request already processed' })
        }
      }

      const updateData = {
        status: action === 'approve' ? 'approved' : 'rejected',
        processed_at: new Date().toISOString(),
        processed_by: 'admin',
        admin_notes: admin_notes || null
      }

      const { error: updateError } = await supabase
        .from('refund_requests')
        .update(updateData)
        .eq('id', refund_request_id)

      if (updateError) {
        console.error('Error updating refund request:', updateError)
        return {
          statusCode: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ detail: 'Failed to update refund request' })
        }
      }

      if (action === 'approve') {
        const { data: contractor, error: contractorError } = await supabase
          .from('contractors')
          .select('wallet_balance')
          .eq('id', refundRequest.contractor_id)
          .single()

        if (!contractorError && contractor) {
          const newBalance = (contractor.wallet_balance || 0) + refundRequest.amount

          await supabase
            .from('contractors')
            .update({ wallet_balance: newBalance })
            .eq('id', refundRequest.contractor_id)

          await supabase
            .from('transactions')
            .insert({
              contractor_id: refundRequest.contractor_id,
              amount: refundRequest.amount,
              source: 'refund',
              notes: `Refund approved for lead ${refundRequest.lead_id}`
            })
        }
      }

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          success: true, 
          message: `Refund request ${action}d successfully`,
          refund_request_id,
          action
        })
      }
    }

    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ detail: 'Method not allowed' })
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
