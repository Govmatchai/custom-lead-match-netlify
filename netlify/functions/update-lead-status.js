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
    const { contractor_lead_id, status, job_value, session_token } = JSON.parse(event.body)

    if (!contractor_lead_id || !status || !session_token) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ detail: 'contractor_lead_id, status, and session_token are required' })
      }
    }

    const validStatuses = ['contacted', 'booked', 'completed', 'did_not_close']
    if (!validStatuses.includes(status)) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ detail: 'Invalid status. Must be one of: contacted, booked, completed, did_not_close' })
      }
    }

    const { data: contractorLead, error: fetchError } = await supabase
      .from('contractor_leads')
      .select('contractor_id, purchased_at, price_paid')
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

    const updateData = {
      status,
      status_updated_at: new Date().toISOString()
    }

    if (status === 'contacted') {
      updateData.contacted_at = new Date().toISOString()
      
      if (contractorLead.purchased_at) {
        const purchaseTime = new Date(contractorLead.purchased_at)
        const contactTime = new Date()
        const responseTimeMinutes = Math.round((contactTime - purchaseTime) / (1000 * 60))
        updateData.response_time_minutes = responseTimeMinutes
      }
    } else if (status === 'booked') {
      updateData.booked_at = new Date().toISOString()
    } else if (status === 'completed') {
      updateData.completed_at = new Date().toISOString()
      if (job_value && parseFloat(job_value) > 0) {
        updateData.job_value = parseFloat(job_value)
      }
    }

    const { error: updateError } = await supabase
      .from('contractor_leads')
      .update(updateData)
      .eq('id', contractor_lead_id)

    if (updateError) {
      console.error('Error updating contractor lead status:', updateError)
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ detail: 'Failed to update lead status' })
      }
    }

    if (status === 'completed' && job_value) {
      try {
        const { data: contractor, error: contractorError } = await supabase
          .from('contractors')
          .select('total_roi')
          .eq('id', contractorLead.contractor_id)
          .single()

        if (!contractorError && contractor) {
          const currentROI = contractor.total_roi || 0
          const leadCost = contractorLead.price_paid || 20
          const newROI = currentROI + (parseFloat(job_value) - leadCost)

          await supabase
            .from('contractors')
            .update({ total_roi: newROI })
            .eq('id', contractorLead.contractor_id)
        }
      } catch (roiError) {
        console.error('Error updating ROI:', roiError)
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
        message: `Lead status updated to ${status}`,
        status,
        updated_at: updateData.status_updated_at
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
