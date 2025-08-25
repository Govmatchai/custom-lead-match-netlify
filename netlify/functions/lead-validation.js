import { createClient } from '@supabase/supabase-js'
import dns from 'dns'
import { promisify } from 'util'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
const resolveMx = promisify(dns.resolveMx)

const validateRequiredFields = (leadData) => {
  const requiredFields = ['customer_name', 'email', 'phone', 'zip_code', 'service_category', 'sub_service']
  const missingFields = []
  
  for (const field of requiredFields) {
    if (!leadData[field] || leadData[field].toString().trim() === '') {
      missingFields.push(field)
    }
  }
  
  return {
    valid: missingFields.length === 0,
    missingFields
  }
}

const validatePhoneNumber = (phone) => {
  if (!phone) return { valid: false, error: 'Phone number is required' }
  
  const cleanPhone = phone.replace(/\D/g, '')
  
  if (cleanPhone.length === 10) {
    return { valid: true, formatted: `+1${cleanPhone}` }
  } else if (cleanPhone.length === 11 && cleanPhone.startsWith('1')) {
    return { valid: true, formatted: `+${cleanPhone}` }
  } else {
    return { valid: false, error: 'Phone must be 10 digits (US format)' }
  }
}

const validateZipCode = (zipCode) => {
  if (!zipCode) return { valid: false, error: 'ZIP code is required' }
  
  const zipRegex = /^\d{5}(-\d{4})?$/
  if (!zipRegex.test(zipCode.toString().trim())) {
    return { valid: false, error: 'ZIP code must be 5 digits or 5+4 format' }
  }
  
  const zip5 = zipCode.toString().trim().substring(0, 5)
  const zipNum = parseInt(zip5)
  
  if (zipNum < 501 || zipNum > 99950) {
    return { valid: false, error: 'Invalid US ZIP code range' }
  }
  
  return { valid: true, zip5 }
}

const validateEmailDeliverability = async (email) => {
  if (!email) return { valid: false, deliverable: false, error: 'Email is required' }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { valid: false, deliverable: false, error: 'Invalid email format' }
  }
  
  const domain = email.split('@')[1]?.toLowerCase()
  
  const disposableEmailDomains = [
    '10minutemail.com', 'tempmail.org', 'guerrillamail.com', 'mailinator.com',
    'throwaway.email', 'temp-mail.org', 'yopmail.org', 'yopmail.com', 'maildrop.cc',
    'sharklasers.com', 'grr.la', 'guerrillamailblock.com', 'dispostable.com',
    'mailnesia.com', 'mailinator.net', 'trashmail.com', 'trashmail.net',
    'spamgourmet.com', 'tempinbox.com', 'fakeinbox.com', 'mytrashmail.com',
    'incognitomail.com', 'getairmail.com', 'getnada.com'
  ]
  
  const highRiskDomains = [
    'mail.ru', 'protonmail.com', 'cock.li', 'tutanota.com', 'tutanota.de',
    'protonmail.ch', 'qq.com', 'aol.com'
  ]
  
  if (disposableEmailDomains.includes(domain)) {
    return { valid: false, deliverable: false, error: 'Disposable email addresses not allowed' }
  }
  
  try {
    const mxRecords = await resolveMx(domain)
    return {
      valid: true,
      deliverable: mxRecords && mxRecords.length > 0,
      domain,
      high_risk: highRiskDomains.includes(domain),
      mx_records: mxRecords?.length || 0
    }
  } catch (error) {
    return {
      valid: false,
      deliverable: false,
      domain,
      error: 'Domain does not exist or has no mail servers',
      high_risk: highRiskDomains.includes(domain)
    }
  }
}

export const validateLead = async (leadData, clientIP) => {
  const validationFlags = {}
  let status = 'valid'

  console.log(`🔍 Validating lead for: ${leadData.customer_name} - ${leadData.phone}`)

  const requiredFieldsCheck = validateRequiredFields(leadData)
  validationFlags.required_fields_valid = requiredFieldsCheck.valid
  if (!requiredFieldsCheck.valid) {
    validationFlags.missing_fields = requiredFieldsCheck.missingFields
    status = 'invalid'
    console.log(`❌ Missing required fields: ${requiredFieldsCheck.missingFields.join(', ')}`)
  }

  const phoneValidation = validatePhoneNumber(leadData.phone)
  validationFlags.phone_valid = phoneValidation.valid
  if (phoneValidation.valid) {
    validationFlags.phone_formatted = phoneValidation.formatted
    console.log(`✅ Phone validation passed: ${leadData.phone} → ${phoneValidation.formatted}`)
  } else {
    validationFlags.phone_error = phoneValidation.error
    if (status === 'valid') status = 'pending_review'
    console.log(`❌ Phone validation failed: ${phoneValidation.error}`)
  }

  const zipValidation = validateZipCode(leadData.zip_code)
  validationFlags.zip_code_valid = zipValidation.valid
  if (zipValidation.valid) {
    validationFlags.zip_code_formatted = zipValidation.zip5
    console.log(`✅ ZIP code validation passed: ${leadData.zip_code}`)
  } else {
    validationFlags.zip_code_error = zipValidation.error
    if (status === 'valid') status = 'pending_review'
    console.log(`❌ ZIP code validation failed: ${zipValidation.error}`)
  }

  const emailValidation = await validateEmailDeliverability(leadData.email)
  validationFlags.email_format_valid = emailValidation.valid
  validationFlags.email_deliverable = emailValidation.deliverable
  validationFlags.email_domain = emailValidation.domain
  validationFlags.email_high_risk = emailValidation.high_risk || false
  validationFlags.email_mx_records = emailValidation.mx_records || 0
  
  if (emailValidation.valid && emailValidation.deliverable) {
    console.log(`✅ Email validation passed: ${leadData.email} (${emailValidation.mx_records} MX records)`)
  } else {
    validationFlags.email_error = emailValidation.error
    if (status === 'valid') status = 'pending_review'
    console.log(`❌ Email validation failed: ${emailValidation.error}`)
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
  const spamKeywords = [
    'spam', 'fake', 'asdf', 'qwerty', 'lorem ipsum', 'testing123',
    'click here', 'free money', 'make money fast', 'work from home',
    'viagra', 'casino', 'lottery', 'winner', 'congratulations',
    'act now', 'limited time', 'call now', 'buy now',
    'sdfgh', 'hjkl', 'zxcv', 'mnbv', 'poiu', 'lkjh', 'gfds',
    'aaaaa', 'bbbbb', 'ccccc', 'ddddd', 'eeee', 'ffff', 'gggg',
    'hello world', 'sample text', 'placeholder', 'dummy',
    'gibberish', 'nonsense', 'random text', 'blah blah', 'xyz',
    'abcdef', '123456', 'qazwsx', 'zxcvbn', 'poiuyt'
  ]
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
