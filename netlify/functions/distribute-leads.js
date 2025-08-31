import { createClient } from '@supabase/supabase-js'
import twilio from 'twilio'
import { notifyContractorsForLead } from './notify-contractors.js'
import dotenv from 'dotenv'

dotenv.config({ path: '../../.env' })

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

let twilioClient = null;
try {
  if (process.env.TWILIO_ACCOUNT_SID && 
      process.env.TWILIO_ACCOUNT_SID !== 'your_twilio_account_sid_here' &&
      process.env.TWILIO_ACCOUNT_SID.startsWith('AC') &&
      process.env.TWILIO_AUTH_TOKEN && 
      process.env.TWILIO_AUTH_TOKEN !== 'your_twilio_auth_token_here') {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
} catch (error) {
  console.log('Twilio initialization failed:', error.message);
}

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
    const requestBody = event.body ? JSON.parse(event.body) : {}
    const { lead_id, force_distribute } = requestBody

    if (lead_id) {
      const { data: lead, error: leadError } = await supabase
        .from('leads')
        .select('*')
        .eq('id', lead_id)
        .single()

      if (leadError || !lead) {
        return {
          statusCode: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ error: 'Lead not found' })
        }
      }

      if (lead.status === 'valid' && (!lead.distributed || force_distribute)) {
        await distributeLead(lead)
        
        await supabase
          .from('leads')
          .update({ 
            distributed: true, 
            distributed_at: new Date().toISOString() 
          })
          .eq('id', lead.id)

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
            message: `Lead ${lead_id} distributed successfully`,
            leads_processed: 1,
            leads_distributed: 1
          })
        }
      }
    }

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
  const { data: smsConfig } = await supabase
    .from('sms_config')
    .select('config_value')
    .eq('config_key', 'sms_budget')
    .single()

  const budgetConfig = smsConfig?.config_value || { 
    monthly_limit_dollars: 500, 
    auto_pause_on_limit: true 
  }
  
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)
  
  const { data: monthlySpend } = await supabase
    .from('sms_send_log')
    .select('cost_cents')
    .gte('timestamp', startOfMonth.toISOString())
  
  const totalSpentCents = monthlySpend?.reduce((sum, log) => sum + (log.cost_cents || 79), 0) || 0
  const totalSpentDollars = totalSpentCents / 100
  
  if (budgetConfig.auto_pause_on_limit && totalSpentDollars >= budgetConfig.monthly_limit_dollars) {
    console.log('SMS budget limit reached, skipping notifications')
    return
  }

  let contractorIndustry = lead.service_category
  if (lead.service_category === 'Home Services' || lead.service_category === 'home_services') {
    contractorIndustry = 'home_services'
  } else if (lead.service_category === 'HVAC' || lead.service_category === 'hvac') {
    contractorIndustry = 'home_services'
  } else if (lead.service_category === 'Plumbing' || lead.service_category === 'plumbing') {
    contractorIndustry = 'home_services'
  } else if (lead.service_category === 'Legal' || lead.service_category === 'legal') {
    contractorIndustry = 'legal'
  } else if (lead.service_category === 'Automotive' || lead.service_category === 'automotive') {
    contractorIndustry = 'automotive'
  }

  let contractorSubService = lead.sub_service?.toLowerCase()

  console.log(`🔍 Looking for contractors with industry: ${contractorIndustry}, sub_service: ${contractorSubService}, zip_code: ${lead.zip_code}`)

  const { data: contractors, error } = await supabase
    .from('contractors')
    .select('*')
    .eq('industry', contractorIndustry)
    .eq('sub_service', contractorSubService)
    .contains('zip_codes', [lead.zip_code])
    .gt('lead_credits', 0)

  console.log(`📋 Found ${contractors?.length || 0} contractors matching criteria`)

  if (error) {
    console.error(`❌ Database error finding contractors for lead ${lead.id}:`, error)
    return
  }

  if (!contractors?.length) {
    console.log(`❌ No matching contractors found for lead ${lead.id}`)
    
    const { data: allContractors } = await supabase
      .from('contractors')
      .select('id, business_name, industry, sub_service, zip_codes, sms_opt_in, is_sms_enabled, lead_credits')
      .limit(10)
    
    console.log(`🔍 Debug - Available contractors:`, allContractors?.map(c => ({
      name: c.business_name,
      industry: c.industry,
      sub_service: c.sub_service,
      zip_codes: c.zip_codes,
      sms_opt_in: c.sms_opt_in,
      is_sms_enabled: c.is_sms_enabled,
      lead_credits: c.lead_credits
    })))
    
    return
  }

  const eligibleContractors = contractors.filter(contractor => {
    const lastActiveDate = contractor.last_active ? new Date(contractor.last_active) : new Date(0)
    const daysSinceActive = (Date.now() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24)
    
    return contractor.is_sms_enabled && 
           contractor.wallet_balance >= 1.00 &&
           daysSinceActive < 14
  })
  
  if (!eligibleContractors.length) {
    console.log('No eligible contractors found for SMS notifications')
    return
  }

  const { data: limitsConfig } = await supabase
    .from('sms_config')
    .select('config_value')
    .eq('config_key', 'notification_limits')
    .single()

  const limits = limitsConfig?.config_value || { default_max_contractors: 5 }
  const maxContractors = limits.category_overrides?.[lead.service_category] || 
                        limits.location_overrides?.[lead.zip_code] || 
                        limits.default_max_contractors || 5

  let targetContractors = eligibleContractors.slice(0, maxContractors)

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

  console.log(`📧 Sending notifications for lead ${lead.id} to ${targetContractors.length} contractors`)
  console.log(`👥 Target contractors for notifications:`, targetContractors.map(c => ({
    id: c.id,
    business_name: c.business_name,
    email: c.email,
    wallet_balance: c.wallet_balance,
    is_sms_enabled: c.is_sms_enabled
  })))
  
  console.log(`🔄 Calling notifyContractorsForLead function...`)
  const notificationResults = await notifyContractorsForLead(lead, targetContractors)
  console.log(`📬 Notification results received:`, notificationResults)
  
  for (const contractor of targetContractors) {
    await supabase
      .from('contractor_activity_log')
      .insert({
        contractor_id: contractor.id,
        event_type: 'lead_notification_sent',
        event_data: {
          lead_id: lead.id,
          service_category: lead.service_category,
          sub_service: lead.sub_service,
          notification_results: notificationResults
        }
      })
  }
  
  console.log(`✅ Lead ${lead.id} notifications sent:`, notificationResults)
  return notificationResults
}
