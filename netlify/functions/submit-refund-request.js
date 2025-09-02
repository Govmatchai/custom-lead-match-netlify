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
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      }
    }
  }

  if (event.httpMethod !== 'POST') {
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
    const { contractor_lead_id, reason, session_token } = JSON.parse(event.body)

    if (!contractor_lead_id || !reason || !session_token) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ detail: 'contractor_lead_id, reason, and session_token are required' })
      }
    }

    const { data: contractorLead, error: fetchError } = await supabase
      .from('contractor_leads')
      .select(`
        contractor_id,
        lead_id,
        price_paid,
        status,
        refund_requested,
        leads (
          id,
          customer_name,
          service_category
        )
      `)
      .eq('id', contractor_lead_id)
      .single()

    if (fetchError || !contractorLead) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ detail: 'Contractor lead not found' })
      }
    }

    const { data: session, error: sessionError } = await supabase
      .from('contractor_sessions')
      .select('*')
      .eq('session_token', session_token)
      .eq('contractor_id', contractorLead.contractor_id)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (sessionError || !session) {
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ detail: 'Invalid or expired session' })
      }
    }

    if (contractorLead.refund_requested) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ detail: 'Refund already requested for this lead' })
      }
    }

    if (contractorLead.status !== 'purchased') {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ detail: 'Can only request refund for purchased leads' })
      }
    }

    const refundAmount = contractorLead.price_paid || 20.00

    const { data: refundRequest, error: refundError } = await supabase
      .from('refund_requests')
      .insert({
        contractor_id: contractorLead.contractor_id,
        lead_id: contractorLead.lead_id,
        contractor_lead_id: contractor_lead_id,
        amount: refundAmount,
        reason: reason,
        status: 'pending'
      })
      .select()
      .single()

    if (refundError) {
      console.error('Error creating refund request:', refundError)
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ detail: 'Failed to create refund request' })
      }
    }

    const { error: updateError } = await supabase
      .from('contractor_leads')
      .update({ 
        refund_requested: true,
        refund_reason: reason
      })
      .eq('id', contractor_lead_id)

    if (updateError) {
      console.error('Error updating contractor lead:', updateError)
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        success: true, 
        message: 'Refund request submitted successfully',
        refund_request_id: refundRequest.id,
        amount: refundAmount
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
