import { createClient } from '@supabase/supabase-js'
import { notifyContractorsForLead } from './notify-contractors.js'
import { sendEmail } from './lib/sendgrid.js'
import { ProductionLogger } from './lib/logger.js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const logger = new ProductionLogger('test-notify')

export const handler = async (event, context) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, Pragma',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'false',
    'Content-Type': 'application/json'
  }

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ detail: 'Method not allowed' })
    }
  }

  try {
    const { contractor_id, contractor_email } = JSON.parse(event.body || '{}')
    
    await logger.info('TEST NOTIFY ENDPOINT CALLED', {
      contractor_id,
      contractor_email,
      timestamp: new Date().toISOString()
    })

    const dummyLead = {
      id: 'test-lead-' + Date.now(),
      customer_name: 'Test Customer',
      service_category: 'Plumbing',
      sub_service: 'Leak Repair',
      zip_code: '98765',
      phone: '(555) 123-4567',
      email: 'test@example.com',
      description: 'Kitchen sink is leaking under the cabinet and water is pooling on the floor. Need urgent repair to prevent water damage.',
      urgency: 'Priority Service',
      urgency_level: 'Priority Service',
      lead_type: 'premium',
      price: 25.00,
      status: 'available'
    }

    let targetContractors = []

    if (contractor_id) {
      const { data: contractor, error } = await supabase
        .from('contractors')
        .select('*')
        .eq('id', contractor_id)
        .single()

      if (error || !contractor) {
        await logger.error('CONTRACTOR NOT FOUND BY ID', {
          contractor_id,
          error: error?.message
        })
        return {
          statusCode: 404,
          headers: corsHeaders,
          body: JSON.stringify({ 
            success: false,
            error: 'Contractor not found',
            contractor_id 
          })
        }
      }

      targetContractors = [contractor]
    } else if (contractor_email) {
      const { data: contractor, error } = await supabase
        .from('contractors')
        .select('*')
        .eq('email', contractor_email)
        .single()

      if (error || !contractor) {
        await logger.error('CONTRACTOR NOT FOUND BY EMAIL', {
          contractor_email,
          error: error?.message
        })
        return {
          statusCode: 404,
          headers: corsHeaders,
          body: JSON.stringify({ 
            success: false,
            error: 'Contractor not found',
            contractor_email 
          })
        }
      }

      targetContractors = [contractor]
    } else {
      const { data: contractors, error } = await supabase
        .from('contractors')
        .select('*')
        .in('email', ['freshsaltyair@gmail.com', 'support@govmatchai.com'])

      if (error) {
        await logger.error('ERROR FETCHING TEST CONTRACTORS', {
          error: error.message
        })
        return {
          statusCode: 500,
          headers: corsHeaders,
          body: JSON.stringify({ 
            success: false,
            error: 'Database error fetching test contractors',
            details: error.message 
          })
        }
      }

      targetContractors = contractors || []
    }

    if (targetContractors.length === 0) {
      await logger.error('NO TARGET CONTRACTORS FOUND', {
        contractor_id,
        contractor_email
      })
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ 
          success: false,
          error: 'No target contractors found for testing'
        })
      }
    }

    await logger.info('TARGET CONTRACTORS FOR TEST', {
      contractorCount: targetContractors.length,
      contractors: targetContractors.map(c => ({
        id: c.id,
        email: c.email,
        business_name: c.business_name,
        industry: c.industry,
        sub_service: c.sub_service,
        zip_codes: c.zip_codes,
        wallet_balance: c.wallet_balance
      }))
    })

    await logger.info('CALLING NOTIFICATION WORKFLOW', {
      leadId: dummyLead.id,
      contractorCount: targetContractors.length
    })

    const notificationResults = await notifyContractorsForLead(dummyLead, targetContractors)

    await logger.info('NOTIFICATION WORKFLOW COMPLETED', {
      leadId: dummyLead.id,
      results: notificationResults
    })

    return {
      statusCode: 200,
      headers: { ...corsHeaders, ...logger.getLogsAsHeaders() },
      body: JSON.stringify({
        success: true,
        message: 'Test notifications sent successfully',
        dummy_lead: dummyLead,
        contractors_tested: targetContractors.length,
        contractors: targetContractors.map(c => ({
          id: c.id,
          email: c.email,
          business_name: c.business_name
        })),
        notification_results: notificationResults,
        debug_logs: logger.getLogsAsString(),
        timestamp: new Date().toISOString()
      })
    }

  } catch (error) {
    await logger.error('TEST NOTIFY ERROR', {
      error: error.message,
      stack: error.stack
    })
    
    console.error('Test notify error:', error)
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        success: false,
        error: 'Internal server error',
        details: error.message 
      })
    }
  }
}
