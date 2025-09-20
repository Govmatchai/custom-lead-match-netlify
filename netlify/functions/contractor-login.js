import { createClient } from '@supabase/supabase-js'
import bcryptjs from 'bcryptjs'
import { randomBytes } from 'crypto'
import dotenv from 'dotenv'
import { checkRateLimit } from './lib/rate-limiter.js'
import { generateTokens } from './lib/jwt-auth.js'
import { verify2FA, verifyBackupCode } from './lib/two-factor-auth.js'

dotenv.config({ path: '../../.env' })

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
      body: JSON.stringify({ success: false, message: 'Method not allowed' })
    }
  }

  try {
    const clientIP = event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'unknown'
    const userAgent = event.headers['user-agent'] || 'unknown'
    
    const rateLimitCheck = await checkRateLimit(clientIP, 'login')
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

    const { username, password, twoFactorToken, backupCode } = JSON.parse(event.body)

    if (!username || !password) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ success: false, message: 'Username and password are required' })
      }
    }

    const supabaseClient = getSupabaseClient()
    if (!supabaseClient) {
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ success: false, message: 'Database not available' })
      }
    }

    const { data: contractor, error: contractorError } = await supabaseClient
      .from('contractors')
      .select('*')
      .eq('username', username)
      .single()

    if (contractorError || !contractor) {
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ success: false, message: 'Invalid username or password' })
      }
    }

    const passwordMatch = await bcryptjs.compare(password, contractor.password_hash)
    
    if (!passwordMatch) {
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ success: false, message: 'Invalid username or password' })
      }
    }

    const { data: twoFA } = await supabaseClient
      .from('contractor_2fa')
      .select('*')
      .eq('contractor_id', contractor.id)
      .single()

    if (twoFA && twoFA.enabled) {
      if (!twoFactorToken && !backupCode) {
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
            success: false,
            requires2FA: true,
            message: 'Two-factor authentication required'
          })
        }
      }

      let twoFAValid = false
      
      if (twoFactorToken) {
        const verification = await verify2FA(contractor.id, twoFactorToken)
        twoFAValid = verification.valid
      } else if (backupCode) {
        const verification = await verifyBackupCode(contractor.id, backupCode)
        twoFAValid = verification.valid
      }

      if (!twoFAValid) {
        return {
          statusCode: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ success: false, message: 'Invalid two-factor authentication code' })
        }
      }
    }

    const { accessToken, refreshToken } = await generateTokens(contractor.id, clientIP, userAgent)

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        contractor_id: contractor.id,
        access_token: accessToken,
        refresh_token: refreshToken,
        session_token: accessToken,
        redirect_url: `/contractor/${contractor.id}`
      })
    }
  } catch (error) {
    console.error('Error processing login:', error)
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
