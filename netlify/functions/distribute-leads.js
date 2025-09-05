import { createClient } from '@supabase/supabase-js'
import twilio from 'twilio'
import { notifyContractorsForLead } from './notify-contractors.js'
import { ProductionLogger } from './lib/logger.js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const logger = new ProductionLogger('distribute-leads')

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

        const debugHeaders = {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          ...logger.getLogsAsHeaders()
        }

        return {
          statusCode: 200,
          headers: debugHeaders,
          body: JSON.stringify({
            message: `Lead ${lead_id} distributed successfully`,
            leads_processed: 1,
            leads_distributed: 1,
            debug_logs: logger.getLogsAsString()
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

    const debugHeaders = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      ...logger.getLogsAsHeaders()
    }

    return {
      statusCode: 200,
      headers: debugHeaders,
      body: JSON.stringify({
        message: `Lead distribution completed`,
        leads_processed: leadsToDistribute?.length || 0,
        leads_distributed: distributedCount,
        debug_logs: logger.getLogsAsString()
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

  await logger.info('SEARCHING FOR CONTRACTORS', {
    leadId: lead.id,
    contractorIndustry,
    contractorSubService,
    zipCode: lead.zip_code
  }, lead.id)

  let contractorQuery = supabase
    .from('contractors')
    .select('*')
    .eq('industry', contractorIndustry)
    .contains('zip_codes', [lead.zip_code])
    .gt('wallet_balance', 0)

  if (contractorIndustry === 'home_services' && 
      (lead.service_category === 'HVAC' || lead.service_category === 'hvac' || 
       contractorSubService?.includes('hvac') || contractorSubService?.includes('air conditioning') || 
       contractorSubService?.includes('heating'))) {
    contractorQuery = contractorQuery.eq('sub_service', 'hvac')
  } else {
    contractorQuery = contractorQuery.eq('sub_service', contractorSubService)
  }

  const { data: contractors, error } = await contractorQuery

  console.log(`📋 Found ${contractors?.length || 0} contractors matching criteria`)

  await logger.info('CONTRACTORS FOUND', {
    leadId: lead.id,
    contractorCount: contractors?.length || 0,
    contractors: contractors?.map(c => ({
      id: c.id,
      businessName: c.business_name,
      email: c.email,
      industry: c.industry,
      subService: c.sub_service,
      zipCodes: c.zip_codes,
      leadCredits: c.lead_credits
    })) || []
  }, lead.id)

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
  
  console.log(`📊 Contractor eligibility check: ${eligibleContractors.length}/${contractors.length} eligible for SMS`)
  
  if (!eligibleContractors.length) {
    console.log('No eligible contractors found for SMS notifications, but still creating contractor_leads entries')
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
  
  console.log(`📧 Creating contractor_leads entries for ALL ${contractors.length} matching contractors`)
  console.log(`📧 Sending notifications to ${targetContractors.length} eligible contractors`)

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
  
  await logger.info('CALLING NOTIFY CONTRACTORS', {
    leadId: lead.id,
    targetContractorCount: targetContractors.length,
    targetContractors: targetContractors.map(c => ({
      id: c.id,
      businessName: c.business_name,
      email: c.email
    }))
  }, lead.id)
  
  const contractorLeadsEntries = contractors.map(contractor => ({
    contractor_id: contractor.id,
    lead_id: lead.id,
    status: 'available',
    created_at: new Date().toISOString()
  }))

  const { error: insertError } = await supabase
    .from('contractor_leads')
    .insert(contractorLeadsEntries)

  if (insertError) {
    console.error('Error creating contractor_leads entries:', insertError)
    await logger.error('CONTRACTOR_LEADS_INSERT_FAILED', {
      leadId: lead.id,
      contractorCount: contractors.length,
      error: insertError.message
    }, lead.id)
    return
  }

  console.log(`✅ Created ${contractorLeadsEntries.length} contractor_leads entries for lead ${lead.id}`)
  
  await logger.info('CONTRACTOR_LEADS_CREATED', {
    leadId: lead.id,
    contractorLeadsCount: contractorLeadsEntries.length,
    contractors: contractors.map(c => ({
      id: c.id,
      businessName: c.business_name,
      email: c.email
    }))
  }, lead.id)

  let notificationResults = null
  if (targetContractors.length > 0) {
    console.log(`📊 Contractors matched (${targetContractors.length} contractors)`)
    notificationResults = await notifyContractorsForLead(lead, targetContractors)
  } else {
    console.log('⚠️ No eligible contractors for notifications, but contractor_leads entries created')
    notificationResults = { message: 'No eligible contractors for notifications' }
  }
  console.log(`📬 Notification results received:`, notificationResults)
  
  await logger.info('NOTIFICATION_RESULTS_RECEIVED', {
    leadId: lead.id,
    notificationResults
  }, lead.id)
  
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
