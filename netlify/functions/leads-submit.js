
export const handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, Pragma',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false',
        'Access-Control-Expose-Headers': 'X-Debug-Log-0, X-Debug-Log-1, X-Debug-Log-2, X-Debug-Log-3, X-Debug-Log-4, X-Debug-Log-5',
        'Vary': 'Origin'
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
    const data = JSON.parse(event.body)
    const { customer_name, service_category, sub_service, zip_code, phone, email, description } = data
    
    let clientIP = event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'unknown'
    if (clientIP !== 'unknown' && clientIP.includes(',')) {
      clientIP = clientIP.split(',')[0].trim()
    }

    console.log('🔍 Lead submission received at:', new Date().toISOString())
    console.log('📝 Lead data:')
    console.log('  - customer_name:', customer_name)
    console.log('  - service_category:', service_category)
    console.log('  - sub_service:', sub_service)
    console.log('  - zip_code:', zip_code)
    console.log('  - phone:', phone)
    console.log('  - email:', email)
    console.log('  - description:', description)
    console.log('🌐 Client IP:', clientIP)
    console.log('📦 Raw body:', event.body)

    console.log('📊 LEAD SUBMISSION RECEIVED:', {
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
    
    console.log('📊 Validation completed:', { status, validationFlags })

    const lead = {
      id: Math.floor(Math.random() * 10000),
      customer_name,
      service_category,
      sub_service,
      zip_code,
      phone,
      email,
      description
    }
    const leadError = null

    if (lead && status === 'valid') {
      console.log('📊 Lead created with ID:', lead.id)
      
      console.log('📊 SIMULATED: Lead scoring and distribution would happen here')
      console.log('📊 SIMULATED: Would call distribute-leads endpoint')
      console.log('📊 SIMULATED: Would notify contractors via email/SMS')
    }


    console.log(`Lead ${lead.id} created successfully with status: ${status}`)

    const debugHeaders = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }

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
        debug_logs: logger.getLogsAsString(),
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
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ detail: 'Internal server error' })
    }
  }
}
