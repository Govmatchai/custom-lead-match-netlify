import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '../../.env' })

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export const logValidationMetrics = async (validationData) => {
  try {
    const { status, validationFlags, leadId, serviceCategory, zipCode } = validationData
    
    const metricsEntry = {
      lead_id: leadId || null,
      status,
      service_category: serviceCategory || null,
      zip_code: zipCode || null,
      validation_timestamp: new Date().toISOString(),
      phone_valid: validationFlags.phone_valid || false,
      email_format_valid: validationFlags.email_format_valid || false,
      email_deliverable: validationFlags.email_deliverable || false,
      is_duplicate: validationFlags.is_duplicate || false,
      content_invalid: validationFlags.content_invalid || false,
      ip_rate_limited: validationFlags.ip_rate_limited || false,
      client_ip: validationFlags.client_ip || null,
      email_domain: validationFlags.email_domain || null
    }
    
    const { data, error } = await supabase
      .from('validation_metrics')
      .insert([metricsEntry])
    
    if (error) {
      console.error('Error logging validation metrics:', error)
      return { success: false, error }
    }
    
    return { success: true, data }
  } catch (error) {
    console.error('Validation metrics logging error:', error)
    return { success: false, error }
  }
}

export const getValidationMetrics = async (options) => {
  try {
    const { startDate, endDate, serviceCategory } = options
    
    let query = supabase
      .from('validation_metrics')
      .select('*')
      .gte('validation_timestamp', startDate)
      .lte('validation_timestamp', endDate)
    
    if (serviceCategory) {
      query = query.eq('service_category', serviceCategory)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error retrieving validation metrics:', error)
      return { success: false, error }
    }
    
    const total = data.length
    const validCount = data.filter(m => m.status === 'valid').length
    const invalidCount = data.filter(m => m.status === 'invalid').length
    const duplicateCount = data.filter(m => m.status === 'duplicate').length
    
    const phoneFailures = data.filter(m => !m.phone_valid).length
    const emailFormatFailures = data.filter(m => !m.email_format_valid).length
    const emailDeliverableFailures = data.filter(m => !m.email_deliverable).length
    const contentFailures = data.filter(m => m.content_invalid).length
    const ipRateLimitFailures = data.filter(m => m.ip_rate_limited).length
    
    const byCategoryMap = data.reduce((acc, item) => {
      const category = item.service_category || 'unknown'
      if (!acc[category]) {
        acc[category] = { total: 0, valid: 0, invalid: 0, duplicate: 0 }
      }
      acc[category].total++
      if (item.status === 'valid') acc[category].valid++
      if (item.status === 'invalid') acc[category].invalid++
      if (item.status === 'duplicate') acc[category].duplicate++
      return acc
    }, {})
    
    const byCategory = Object.entries(byCategoryMap).map(([category, stats]) => ({
      category,
      ...stats,
      valid_rate: stats.total > 0 ? (stats.valid / stats.total * 100).toFixed(1) + '%' : '0%'
    }))
    
    return {
      success: true,
      summary: {
        total,
        valid: validCount,
        invalid: invalidCount,
        duplicate: duplicateCount,
        valid_rate: total > 0 ? (validCount / total * 100).toFixed(1) + '%' : '0%',
        failure_reasons: {
          phone_invalid: phoneFailures,
          email_format_invalid: emailFormatFailures,
          email_not_deliverable: emailDeliverableFailures,
          content_invalid: contentFailures,
          ip_rate_limited: ipRateLimitFailures
        },
        by_category: byCategory
      },
      raw_data: data
    }
  } catch (error) {
    console.error('Error generating validation metrics summary:', error)
    return { success: false, error }
  }
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
  
  if (event.httpMethod === 'GET') {
    try {
      const { start_date, end_date, service_category } = event.queryStringParameters || {}
      
      if (!start_date || !end_date) {
        return {
          statusCode: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ success: false, message: 'start_date and end_date are required' })
        }
      }
      
      const metrics = await getValidationMetrics({
        startDate: start_date,
        endDate: end_date,
        serviceCategory: service_category
      })
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(metrics)
      }
    } catch (error) {
      console.error('Error:', error)
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ success: false, message: 'Internal server error' })
      }
    }
  }
  
  return {
    statusCode: 405,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({ success: false, message: 'Method not allowed' })
  }
}
