import { createClient } from '@supabase/supabase-js'
import { notifyContractorsForLead } from './notify-contractors.js'
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
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ detail: 'Method not allowed' })
    }
  }

  try {
    const { lead_id, contractor_ids } = JSON.parse(event.body)

    if (!lead_id || !contractor_ids || contractor_ids.length === 0) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ detail: 'Lead ID and contractor IDs are required' })
      }
    }

    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', lead_id)
      .single()

    if (leadError || !lead) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ detail: 'Lead not found' })
      }
    }

    const { data: contractors, error: contractorsError } = await supabase
      .from('contractors')
      .select('*')
      .in('id', contractor_ids)

    if (contractorsError || !contractors || contractors.length === 0) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ detail: 'Contractors not found' })
      }
    }

    const results = await notifyContractorsForLead(lead, contractors)

    for (const contractor of contractors) {
      await supabase
        .from('contractor_activity_log')
        .insert({
          contractor_id: contractor.id,
          event_type: 'manual_lead_notification_sent',
          event_data: {
            lead_id: lead.id,
            service_category: lead.service_category,
            sub_service: lead.sub_service,
            sent_by: 'admin'
          }
        })
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        message: 'Notifications sent successfully',
        results,
        contractors_notified: contractors.length
      })
    }
  } catch (error) {
    console.error('Error sending manual notifications:', error)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ detail: 'Internal server error' })
    }
  }
}
