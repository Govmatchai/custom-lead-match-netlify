import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { record } = await req.json()
    const lead = record

    console.log(`Processing lead ${lead.id} for contractor matching`)

    const { data: smsConfig } = await supabaseClient
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
    
    const { data: monthlySpend } = await supabaseClient
      .from('sms_send_log')
      .select('cost_cents')
      .gte('timestamp', startOfMonth.toISOString())
    
    const totalSpentCents = monthlySpend?.reduce((sum, log) => sum + (log.cost_cents || 79), 0) || 0
    const totalSpentDollars = totalSpentCents / 100
    
    if (budgetConfig.auto_pause_on_limit && totalSpentDollars >= budgetConfig.monthly_limit_dollars) {
      console.log('SMS budget limit reached, skipping notifications')
      return new Response(JSON.stringify({ 
        success: true, 
        contractors_notified: 0,
        message: 'SMS budget limit reached'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { data: limitsConfig } = await supabaseClient
      .from('sms_config')
      .select('config_value')
      .eq('config_key', 'notification_limits')
      .single()

    const limits = limitsConfig?.config_value || { default_max_contractors: 5 }
    const maxContractors = limits.category_overrides?.[lead.service_category] || 
                          limits.location_overrides?.[lead.zip_code] || 
                          limits.default_max_contractors || 5

    const { data: matchingContractors, error: contractorError } = await supabaseClient
      .from('contractors')
      .select('id, phone, email, sms_opt_in, business_name, is_sms_enabled, last_active, wallet_balance')
      .eq('industry', lead.service_category)
      .eq('sub_service', lead.sub_service)
      .contains('zip_codes', [lead.zip_code])
      .eq('sms_opt_in', true)
      .eq('is_sms_enabled', true)
      .gt('wallet_balance', 1.00)
      .limit(maxContractors)

    if (contractorError) {
      console.error('Contractor query error:', contractorError)
      return new Response(JSON.stringify({ error: contractorError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const eligibleContractors = matchingContractors?.filter(contractor => {
      const lastActiveDate = contractor.last_active ? new Date(contractor.last_active) : new Date(0)
      const daysSinceActive = (Date.now() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24)
      return daysSinceActive < 14
    }) || []

    console.log(`Found ${eligibleContractors.length} eligible contractors for lead ${lead.id}`)

    if (eligibleContractors.length > 0) {
      try {
        const netlifyUrl = Deno.env.get('NETLIFY_URL') || 'https://customleadmatch.netlify.app'
        const distributeResponse = await fetch(`${netlifyUrl}/.netlify/functions/distribute-leads`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
          },
          body: JSON.stringify({ 
            lead_id: lead.id,
            force_distribute: true 
          })
        })

        if (!distributeResponse.ok) {
          console.error('Distribute leads failed:', await distributeResponse.text())
        } else {
          console.log('Successfully triggered lead distribution')
        }
      } catch (distributeError) {
        console.error('Error calling distribute-leads:', distributeError)
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      contractors_notified: eligibleContractors.length,
      budget_remaining: budgetConfig.monthly_limit_dollars - totalSpentDollars
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
