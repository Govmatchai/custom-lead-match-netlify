import { createClient } from '@supabase/supabase-js'
import twilio from 'twilio'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

let twilioClient = null
try {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_ACCOUNT_SID.startsWith('AC')) {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  }
} catch (error) {
  console.log('Twilio not initialized (likely local dev environment)')
}

export const validateLead = async (leadData, clientIP) => {
  const validationFlags = {}
  let status = 'valid'

  console.log(`🔍 Validating lead for phone: ${leadData.phone}`)

  try {
    if (twilioClient) {
      const phoneNumber = await twilioClient.lookups.v1.phoneNumbers(leadData.phone).fetch()
      validationFlags.phone_valid = true
      validationFlags.phone_carrier = phoneNumber.carrier?.name || 'unknown'
      console.log(`✅ Phone validation passed for ${leadData.phone}`)
    } else {
      console.log(`⚠️ Skipping phone validation for ${leadData.phone} (local dev)`)
      validationFlags.phone_valid = true
      validationFlags.phone_carrier = 'local-dev-skip'
    }
  } catch (error) {
    console.log(`❌ Phone validation failed for ${leadData.phone}:`, error.message)
    validationFlags.phone_valid = false
    validationFlags.phone_error = error.message
    if (status === 'valid') {
      status = 'pending_review'
    }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  validationFlags.email_format_valid = emailRegex.test(leadData.email || '')
  
  if (leadData.email) {
    const emailDomain = leadData.email.split('@')[1]?.toLowerCase()
    
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
    
    validationFlags.email_deliverable = !disposableEmailDomains.includes(emailDomain)
    validationFlags.email_domain = emailDomain
    validationFlags.email_high_risk = highRiskDomains.includes(emailDomain)
    
    console.log(`📧 Email validation for ${leadData.email}:`)
    console.log(`- Format valid: ${validationFlags.email_format_valid}`)
    console.log(`- Domain: ${emailDomain}`)
    console.log(`- Deliverable: ${validationFlags.email_deliverable}`)
    console.log(`- High risk: ${validationFlags.email_high_risk}`)
    
    if (!validationFlags.email_format_valid || !validationFlags.email_deliverable) {
      if (leadData.email && leadData.email.trim() !== '') {
        status = 'pending_review'  // Changed from 'invalid' to 'pending_review'
        console.log(`❌ Email validation failed for ${leadData.email}`)
      }
    }
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
    'test', 'spam', 'fake', 'asdf', 'qwerty', 'lorem ipsum', 'testing',
    'click here', 'free money', 'make money fast', 'work from home',
    'viagra', 'casino', 'lottery', 'winner', 'congratulations',
    'urgent', 'act now', 'limited time', 'call now', 'buy now',
    'sdfgh', 'hjkl', 'zxcv', 'mnbv', 'poiu', 'lkjh', 'gfds',
    'aaaaa', 'bbbbb', 'ccccc', 'ddddd', 'eeee', 'ffff', 'gggg',
    'hello world', 'sample text', 'example', 'placeholder', 'dummy',
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
