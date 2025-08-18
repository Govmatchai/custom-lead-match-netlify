import { createClient } from '@supabase/supabase-js'
import twilio from 'twilio'
import { notifyContractorsForLead } from './notify-contractors.js'
import dotenv from 'dotenv'

dotenv.config({ path: '../../.env' })

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

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
    const now = new Date()
    
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString()
    const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString()
    const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString()
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()

    const { data: leadsToDistribute, error } = await supabase
      .from('leads')
      .select('*')
      .eq('status', 'valid')
      .eq('distributed', false)
      .or(`
        and(lead_score.gte.85,created_at.lte.${now.toISOString()}),
        and(lead_score.gte.70,lead_score.lt.85,created_at.lte.${twoHoursAgo}),
        and(lead_score.lt.70,created_at.lte.${twelveHoursAgo})
      `)

    if (error) {
      console.error('Query error:', error)
      throw error
    }

    let distributedCount = 0

    for (const lead of leadsToDistribute || []) {
      try {
        await distributeLead(lead)
        
        await supabase
          .from('leads')
          .update({ 
            distributed: true, 
            distributed_at: now.toISOString() 
          })
          .eq('id', lead.id)
        
        distributedCount++
      } catch (error) {
        console.error(`Error distributing lead ${lead.id}:`, error)
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: `Lead distribution completed`,
        leads_processed: leadsToDistribute?.length || 0,
        leads_distributed: distributedCount
      })
    }
  } catch (error) {
    console.error('Distribution error:', error)
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Distribution failed' })
    }
  }
}

async function distributeLead(lead) {
  const { data: contractors, error } = await supabase
    .from('contractors')
    .select('*')
    .eq('industry', lead.service_category)
    .eq('sub_service', lead.sub_service)
    .contains('zip_codes', [lead.zip_code])
    .gt('lead_credits', 0)
    .eq('sms_opt_in', true)

  if (error || !contractors?.length) {
    console.log(`No matching contractors found for lead ${lead.id}`)
    return
  }

  let targetContractors = contractors
  if (lead.lead_score >= 85) {
    targetContractors = contractors.slice(0, 3)
  }

  const token = require('crypto').randomBytes(16).toString('hex')
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

  const { error: tokenError } = await supabase
    .from('claim_tokens')
    .insert([{
      token,
      lead_id: lead.id,
      expires_at: expiresAt.toISOString()
    }])

  if (tokenError) {
    console.error('Token creation error:', tokenError)
    return
  }

  const notificationResults = await notifyContractorsForLead(lead, targetContractors)
  
  console.log(`✅ Lead ${lead.id} notifications sent:`, notificationResults)
}
