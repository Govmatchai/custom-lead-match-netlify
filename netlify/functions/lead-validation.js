import { createClient } from '@supabase/supabase-js'
import twilio from 'twilio'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

export const validateLead = async (leadData, clientIP) => {
  const validationFlags = {}
  let status = 'valid'

  console.log(`🔍 Validating lead for phone: ${leadData.phone}`)

  try {
    const phoneNumber = await twilioClient.lookups.v1.phoneNumbers(leadData.phone).fetch()
    validationFlags.phone_valid = true
    validationFlags.phone_carrier = phoneNumber.carrier?.name || 'unknown'
    console.log(`✅ Phone validation passed for ${leadData.phone}`)
  } catch (error) {
    console.log(`❌ Phone validation failed for ${leadData.phone}:`, error.message)
    validationFlags.phone_valid = false
    validationFlags.phone_error = error.message
    status = 'invalid'
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  validationFlags.email_format_valid = emailRegex.test(leadData.email || '')
  if (leadData.email && !validationFlags.email_format_valid) {
    status = 'invalid'
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const { data: duplicates } = await supabase
    .from('leads')
    .select('id')
    .or(`phone.eq.${leadData.phone}${leadData.email ? `,email.eq.${leadData.email}` : ''}`)
    .gte('created_at', thirtyDaysAgo.toISOString())

  if (duplicates && duplicates.length > 0) {
    validationFlags.is_duplicate = true
    status = 'duplicate'
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
  const { data: ipSubmissions } = await supabase
    .from('leads')
    .select('id')
    .eq('ip_address', clientIP)
    .gte('created_at', oneHourAgo.toISOString())

  if (ipSubmissions && ipSubmissions.length >= 2) {
    validationFlags.ip_rate_limited = true
    status = 'invalid'
  }

  const description = leadData.description.toLowerCase()
  const spamKeywords = ['test', 'spam', 'fake', 'asdf', 'qwerty', 'lorem ipsum', 'testing']
  const hasSpamContent = spamKeywords.some(keyword => description.includes(keyword))
  
  if (hasSpamContent || description.length < 10 || description.split(' ').length < 3) {
    console.log(`❌ Content validation failed: hasSpamContent=${hasSpamContent}, length=${description.length}, words=${description.split(' ').length}`)
    validationFlags.content_invalid = true
    status = 'invalid'
  }

  validationFlags.validation_timestamp = new Date().toISOString()
  validationFlags.client_ip = clientIP

  console.log(`🎯 Final validation status: ${status}`)
  console.log(`📋 Validation flags:`, validationFlags)

  return { status, validationFlags }
}
