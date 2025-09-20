import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

let supabase = null

function getSupabaseClient() {
  if (!supabase && process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
    supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    )
  }
  return supabase
}

const RATE_LIMITS = {
  signup: { requests: 3, window: 3600000 },
  login: { requests: 10, window: 900000 },
  submit: { requests: 5, window: 3600000 },
  admin_login: { requests: 5, window: 900000 },
  default: { requests: 100, window: 3600000 }
}

const memoryStore = new Map()
const RATE_LIMIT_DIR = '/tmp/rate-limits'

export const checkRateLimit = async (identifier, endpoint = 'default') => {
  const config = RATE_LIMITS[endpoint] || RATE_LIMITS.default
  const windowStart = new Date(Date.now() - config.window)
  
  const supabaseClient = getSupabaseClient()
  
  if (!supabaseClient) {
    console.log('Using file-based rate limiting (no database credentials)')
    return checkRateLimitFile(identifier, endpoint, config, windowStart)
  }
  
  try {
    await supabaseClient.rpc('create_rate_limit_table_if_not_exists')
  } catch (error) {
    console.log('Rate limit table creation skipped (likely already exists)')
  }
  
  const { data: requests, error } = await supabaseClient
    .from('rate_limit_logs')
    .select('id')
    .eq('identifier', identifier)
    .eq('endpoint', endpoint)
    .gte('created_at', windowStart.toISOString())
  
  if (error) {
    console.error('Rate limit check error, falling back to file store:', error)
    return checkRateLimitFile(identifier, endpoint, config, windowStart)
  }
  
  const currentCount = requests?.length || 0
  
  if (currentCount >= config.requests) {
    return {
      allowed: false,
      error: `Rate limit exceeded. Max ${config.requests} requests per ${config.window/60000} minutes.`,
      retryAfter: Math.ceil(config.window / 1000)
    }
  }
  
  await supabaseClient
    .from('rate_limit_logs')
    .insert({
      identifier,
      endpoint,
      created_at: new Date().toISOString()
    })
  
  return { allowed: true }
}

function checkRateLimitMemory(identifier, endpoint, config, windowStart) {
  const key = `${identifier}:${endpoint}`
  const now = Date.now()
  
  if (!memoryStore.has(key)) {
    memoryStore.set(key, [])
  }
  
  const requests = memoryStore.get(key)
  
  const validRequests = requests.filter(timestamp => timestamp > windowStart.getTime())
  memoryStore.set(key, validRequests)
  
  if (validRequests.length >= config.requests) {
    return {
      allowed: false,
      error: `Rate limit exceeded. Max ${config.requests} requests per ${config.window/60000} minutes.`,
      retryAfter: Math.ceil(config.window / 1000)
    }
  }
  
  validRequests.push(now)
  memoryStore.set(key, validRequests)
  
  return { allowed: true }
}

function checkRateLimitFile(identifier, endpoint, config, windowStart) {
  const key = `${identifier}:${endpoint}`
  const now = Date.now()
  
  try {
    if (!fs.existsSync(RATE_LIMIT_DIR)) {
      fs.mkdirSync(RATE_LIMIT_DIR, { recursive: true })
    }
    
    const filePath = path.join(RATE_LIMIT_DIR, `${key.replace(/[^a-zA-Z0-9]/g, '_')}.json`)
    
    let requests = []
    if (fs.existsSync(filePath)) {
      try {
        const data = fs.readFileSync(filePath, 'utf8')
        requests = JSON.parse(data)
      } catch (parseError) {
        console.log('Failed to parse rate limit file, starting fresh')
        requests = []
      }
    }
    
    const validRequests = requests.filter(timestamp => timestamp > windowStart.getTime())
    
    console.log(`Rate limit check for ${key}: ${validRequests.length}/${config.requests} requests in window`)
    
    if (validRequests.length >= config.requests) {
      return {
        allowed: false,
        error: `Rate limit exceeded. Max ${config.requests} requests per ${config.window/60000} minutes.`,
        retryAfter: Math.ceil(config.window / 1000)
      }
    }
    
    validRequests.push(now)
    
    fs.writeFileSync(filePath, JSON.stringify(validRequests))
    
    return { allowed: true }
  } catch (error) {
    console.error('File-based rate limiting error:', error)
    return { allowed: true }
  }
}
