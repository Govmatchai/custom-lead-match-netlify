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
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
      body: JSON.stringify({ success: false, message: 'Method not allowed' })
    }
  }

  try {
    const data = JSON.parse(event.body)
    const { contractor_id, lead_id } = data

    if (!contractor_id || !lead_id) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ success: false, message: 'contractor_id and lead_id are required' })
      }
    }

    const authHeader = event.headers.authorization || event.headers.Authorization
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      
      const { data: session, error: sessionError } = await supabase
        .from('contractor_sessions')
        .select('*')
        .eq('session_token', token)
        .eq('contractor_id', contractor_id)
        .gt('expires_at', new Date().toISOString())
        .single()
      
      if (sessionError || !session) {
        return {
          statusCode: 403,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ success: false, message: 'Invalid or expired authorization token' })
        }
      }
    }

    const { data: purchasedLead, error: purchaseError } = await supabase
      .from('purchased_leads')
      .select('*')
      .eq('contractor_id', contractor_id)
      .eq('lead_id', lead_id)
      .neq('status', 'completed')
      .single()

    if (purchaseError || !purchasedLead) {
      return {
        statusCode: 403,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ success: false, message: 'Lead not found or already completed for this contractor' })
      }
    }

    const { error: insertError } = await supabase
      .from('completed_leads')
      .insert({
        contractor_id: contractor_id,
        lead_id: lead_id,
        price_paid: purchasedLead.price_paid,
        completed_at: new Date().toISOString()
      })

    if (insertError && insertError.code !== '23505') { // Ignore duplicate key errors
      console.error('Error inserting into completed_leads:', insertError)
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ success: false, message: 'Failed to mark lead as completed' })
      }
    }

    // Update the status of that lead in purchased_leads to 'completed'
    const { error: updateError } = await supabase
      .from('purchased_leads')
      .update({ 
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('contractor_id', contractor_id)
      .eq('lead_id', lead_id)

    if (updateError) {
      console.error('Error updating purchased_leads status:', updateError)
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ success: false, message: 'Failed to update lead status' })
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ success: true })
    }

  } catch (error) {
    console.error('Error marking lead as complete:', error)
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ success: false, message: 'Internal server error' })
    }
  }
}
