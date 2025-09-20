import { createClient } from '@supabase/supabase-js'
import bcryptjs from 'bcryptjs'
import { checkRateLimit } from './lib/rate-limiter.js'
import dotenv from 'dotenv'

dotenv.config({ path: '../../.env' })

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

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
    const clientIP = event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'unknown'
    
    const rateLimitCheck = await checkRateLimit(clientIP, 'admin_login')
    if (!rateLimitCheck.allowed) {
      return {
        statusCode: 429,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Retry-After': rateLimitCheck.retryAfter.toString()
        },
        body: JSON.stringify({ 
          success: false, 
          message: rateLimitCheck.error 
        })
      }
    }

    const data = JSON.parse(event.body)
    const { email, password, twoFactorToken, backupCode } = data

    if (!email || !password) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ success: false, message: 'Email and password are required' })
      }
    }

    const adminPassword = process.env.ADMIN_PASSWORD
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@customleadmatch.com'
    
    if (!adminPassword) {
      console.error('ADMIN_PASSWORD environment variable not set')
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ detail: 'Server configuration error' })
      }
    }

    if (email !== adminEmail || password !== adminPassword) {
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ success: false, message: 'Invalid credentials' })
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ success: true, message: 'Authentication successful' })
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
