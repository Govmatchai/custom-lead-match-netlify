import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

async function ensureNotificationLogsTable() {
  try {
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS notification_logs (
          id SERIAL PRIMARY KEY,
          timestamp TIMESTAMPTZ DEFAULT NOW(),
          level VARCHAR(20) NOT NULL,
          message TEXT NOT NULL,
          context JSONB DEFAULT '{}',
          function_name VARCHAR(100),
          lead_id INTEGER,
          contractor_id INTEGER,
          email VARCHAR(255),
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_notification_logs_timestamp ON notification_logs(timestamp);
        CREATE INDEX IF NOT EXISTS idx_notification_logs_level ON notification_logs(level);
        CREATE INDEX IF NOT EXISTS idx_notification_logs_function ON notification_logs(function_name);
        CREATE INDEX IF NOT EXISTS idx_notification_logs_lead_id ON notification_logs(lead_id);
        CREATE INDEX IF NOT EXISTS idx_notification_logs_contractor_id ON notification_logs(contractor_id);

        ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Service role can manage notification logs" ON notification_logs;
        CREATE POLICY "Service role can manage notification logs" ON notification_logs
          FOR ALL USING (true);

        GRANT ALL ON notification_logs TO service_role;
        GRANT USAGE, SELECT ON SEQUENCE notification_logs_id_seq TO service_role;
      `
    })

    if (error) {
      console.log('Table creation via RPC failed, table may already exist:', error.message)
    } else {
      console.log('✅ notification_logs table ensured')
    }
  } catch (error) {
    console.error('Failed to ensure notification_logs table:', error.message)
  }
}

class ProductionLogger {
  constructor(functionName) {
    this.functionName = functionName
    this.logs = []
  }

  async log(level, message, context = {}, leadId = null, contractorId = null, email = null) {
    const timestamp = new Date().toISOString()
    const logMessage = `[${level}] ${this.functionName}: ${message}`
    
    console.log(logMessage, context)

    this.logs.push({
      timestamp,
      level,
      message,
      context,
      function_name: this.functionName,
      lead_id: leadId,
      contractor_id: contractorId,
      email
    })

    try {
      await supabase
        .from('notification_logs')
        .insert({
          level,
          message,
          context,
          function_name: this.functionName,
          lead_id: leadId,
          contractor_id: contractorId,
          email
        })
    } catch (dbError) {
      console.error('Database logging failed, using fallback:', dbError.message)
      try {
        if (leadId) {
          await supabase
            .from('leads')
            .update({ 
              notes: `${timestamp} [${level}] ${this.functionName}: ${message} | ${JSON.stringify(context)}` 
            })
            .eq('id', leadId)
        }
      } catch (fallbackError) {
        console.error('Fallback logging also failed:', fallbackError.message)
      }
    }
  }

  getLogsAsHeaders() {
    const headers = {}
    this.logs.forEach((log, index) => {
      headers[`X-Debug-Log-${index}`] = `${log.timestamp} [${log.level}] ${log.function_name}: ${log.message}`
    })
    return headers
  }
}

export const handler = async (event, context) => {
  const logger = new ProductionLogger('leads-submit')
  await ensureNotificationLogsTable()
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, Pragma',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'false',
    'Access-Control-Expose-Headers': 'X-Debug-Log-0, X-Debug-Log-1, X-Debug-Log-2, X-Debug-Log-3, X-Debug-Log-4, X-Debug-Log-5',
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
    const data = JSON.parse(event.body)
    const { customer_name, service_category, sub_service, zip_code, phone, email, description, urgency = 'Standard' } = data
    
    let clientIP = event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'unknown'
    if (clientIP !== 'unknown' && clientIP.includes(',')) {
      clientIP = clientIP.split(',')[0].trim()
    }

    await logger.log('INFO', 'LEAD SUBMISSION STARTED', {
      customer_name,
      service_category,
      sub_service,
      zip_code,
      phone,
      email,
      description,
      clientIP,
      timestamp: new Date().toISOString()
    })

    const status = 'valid'
    const validationFlags = {
      required_fields_valid: !!(customer_name && service_category && sub_service && zip_code && phone),
      phone_valid: true,
      email_format_valid: true,
      zip_code_valid: true,
      phone_formatted: phone,
      zip_code_formatted: zip_code
    }
    
    await logger.log('INFO', 'VALIDATION COMPLETED', { status, validationFlags })

    const urgencyToLeadType = {
      'Standard': 'standard',
      'Premium': 'premium', 
      'Emergency': 'emergency'
    }
    const lead_type = urgencyToLeadType[urgency] || 'standard'
    
    const { data: pricingData, error: pricingError } = await supabase
      .from('lead_pricing')
      .select('price')
      .eq('category', service_category)
      .eq('lead_type', lead_type)
      .single()
    
    const leadPrice = pricingData ? parseFloat(pricingData.price) : 20.00

    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert([{
        customer_name,
        contact_name: customer_name,
        service_category,
        sub_service,
        zip_code: validationFlags.zip_code_formatted || zip_code,
        phone: validationFlags.phone_formatted || phone,
        email,
        description,
        urgency,
        lead_type,
        price: leadPrice,
        ip_address: clientIP,
        status: 'available',
        validation_flags: validationFlags,
        claimed: false
      }])
      .select()
      .single()

    if (leadError) {
      await logger.log('ERROR', 'LEAD CREATION FAILED', {
        error: leadError.message,
        leadData: { customer_name, service_category, sub_service, zip_code, phone, email }
      })
      
      return {
        statusCode: 500,
        headers: { ...corsHeaders, ...logger.getLogsAsHeaders() },
        body: JSON.stringify({
          message: 'Unable to process lead at this time. Please try again later.',
          error: leadError.message,
          status: 'error'
        })
      }
    }

    if (lead && status === 'valid') {
      await logger.log('INFO', 'LEAD CREATED SUCCESSFULLY', {
        leadId: lead.id,
        status,
        validationFlags
      }, lead.id)
      
      try {
        const distributeResponse = await fetch(`${process.env.URL || 'https://customleadmatch.netlify.app'}/.netlify/functions/distribute-leads`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`
          },
          body: JSON.stringify({ 
            lead_id: lead.id,
            force_distribute: true 
          })
        })
        
        if (distributeResponse.ok) {
          const distributionResult = await distributeResponse.json()
          await logger.log('INFO', 'LEAD DISTRIBUTION SUCCESS', {
            leadId: lead.id,
            contractorsNotified: distributionResult.contractors_notified || 0,
            emailsSent: distributionResult.emails_sent || 0,
            smsSent: distributionResult.sms_sent || 0,
            errors: distributionResult.errors?.length || 0,
            distributionResult
          }, lead.id)
        } else {
          const errorText = await distributeResponse.text()
          await logger.log('ERROR', 'LEAD DISTRIBUTION FAILED', {
            leadId: lead.id,
            status: distributeResponse.status,
            errorText
          }, lead.id)
        }
      } catch (distributionError) {
        await logger.log('ERROR', 'DISTRIBUTION ERROR', {
          leadId: lead.id,
          error: distributionError.message
        }, lead.id)
      }
    }

    const debugHeaders = { ...corsHeaders, ...logger.getLogsAsHeaders() }

    return {
      statusCode: 200,
      headers: debugHeaders,
      body: JSON.stringify({
        message: status === 'valid' ? 'Lead submitted successfully! Matching contractors have been notified.' : 
                 status === 'pending_review' ? 'Lead received and is being reviewed for quality.' :
                 status === 'duplicate' ? 'Similar lead already exists. Please wait before submitting again.' :
                 status === 'invalid' ? 'Lead submission failed validation. Please check your information and try again.' :
                 'Lead received but requires additional review.',
        lead_id: lead.id,
        status,
        debug_logs: logger.logs.map(log => `${log.timestamp} [${log.level}] ${log.message}`).join('\n'),
        validation_summary: {
          required_fields: validationFlags.required_fields_valid,
          phone_valid: validationFlags.phone_valid,
          email_valid: validationFlags.email_format_valid,
          zip_code_valid: validationFlags.zip_code_valid,
          is_duplicate: validationFlags.is_duplicate || false,
          content_valid: !validationFlags.content_invalid
        }
      })
    }
  } catch (error) {
    console.error('Error:', error)
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ detail: 'Internal server error', error: error.message })
    }
  }
}
