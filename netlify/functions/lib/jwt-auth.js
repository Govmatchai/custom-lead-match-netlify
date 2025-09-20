import jwt from 'jsonwebtoken'
import { createClient } from '@supabase/supabase-js'

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

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = '1h'
const REFRESH_TOKEN_EXPIRES_IN = '7d'

export const generateTokens = async (contractorId, ipAddress, userAgent) => {
  const accessToken = jwt.sign(
    { contractorId, type: 'access' },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )
  
  const refreshToken = jwt.sign(
    { contractorId, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  )
  
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  
  const supabaseClient = getSupabaseClient()
  if (!supabaseClient) {
    throw new Error('Database not available')
  }

  const { error } = await supabaseClient
    .from('contractor_sessions')
    .insert({
      contractor_id: contractorId,
      session_token: accessToken,
      refresh_token: refreshToken,
      expires_at: expiresAt.toISOString(),
      ip_address: ipAddress,
      user_agent: userAgent,
      last_activity: new Date().toISOString()
    })
  
  if (error) {
    throw new Error('Failed to create session')
  }
  
  return { accessToken, refreshToken }
}

export const verifyToken = async (token, contractorId = null) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    
    if (decoded.type !== 'access') {
      return { valid: false, error: 'Invalid token type' }
    }
    
    const supabaseClient = getSupabaseClient()
    if (!supabaseClient) {
      return { valid: false, error: 'Database not available' }
    }

    const { data: session, error } = await supabaseClient
      .from('contractor_sessions')
      .select('*')
      .eq('session_token', token)
      .gt('expires_at', new Date().toISOString())
      .single()
    
    if (error || !session) {
      return { valid: false, error: 'Session not found or expired' }
    }
    
    if (contractorId && session.contractor_id !== contractorId) {
      return { valid: false, error: 'Token contractor mismatch' }
    }
    
    await supabaseClient
      .from('contractor_sessions')
      .update({ last_activity: new Date().toISOString() })
      .eq('id', session.id)
    
    return { valid: true, session, contractorId: decoded.contractorId }
  } catch (error) {
    return { valid: false, error: error.message }
  }
}

export const refreshAccessToken = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET)
    
    if (decoded.type !== 'refresh') {
      return { success: false, error: 'Invalid refresh token' }
    }
    
    const supabaseClient = getSupabaseClient()
    if (!supabaseClient) {
      return { success: false, error: 'Database not available' }
    }

    const { data: session, error } = await supabaseClient
      .from('contractor_sessions')
      .select('*')
      .eq('refresh_token', refreshToken)
      .gt('expires_at', new Date().toISOString())
      .single()
    
    if (error || !session) {
      return { success: false, error: 'Refresh token not found or expired' }
    }
    
    const newAccessToken = jwt.sign(
      { contractorId: decoded.contractorId, type: 'access' },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )
    
    await supabaseClient
      .from('contractor_sessions')
      .update({ 
        session_token: newAccessToken,
        last_activity: new Date().toISOString()
      })
      .eq('id', session.id)
    
    return { success: true, accessToken: newAccessToken }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
