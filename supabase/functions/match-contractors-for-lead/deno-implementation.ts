
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

    const { data: matchingContractors, error: contractorError } = await supabaseClient
      .from('contractors')
      .select('id, phone, email, sms_opt_in, business_name')
      .eq('industry', lead.service_category)
      .eq('sub_service', lead.sub_service)
      .contains('zip_codes', [lead.zip_code])
      .eq('sms_opt_in', true)

    if (contractorError) {
      console.error('Contractor query error:', contractorError)
      return new Response(JSON.stringify({ error: contractorError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (matchingContractors && matchingContractors.length > 0) {
      const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
      const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')
      const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER') || '+13157844568'

      const claimUrl = `https://customleadmatch.netlify.app/claim-lead/${lead.id}`

      for (const contractor of matchingContractors) {
        try {
          const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`, {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              From: twilioPhoneNumber,
              To: contractor.phone,
              Body: `🔥 New ${lead.service_category} Lead: ${lead.zip_code} - ${lead.sub_service}. Pre-screened & validated. Click to claim: ${claimUrl}`
            })
          })

          if (!response.ok) {
            console.error(`SMS error for contractor ${contractor.id}:`, await response.text())
          }
        } catch (smsError) {
          console.error(`SMS error for contractor ${contractor.id}:`, smsError)
        }
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      contractors_notified: matchingContractors?.length || 0 
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
