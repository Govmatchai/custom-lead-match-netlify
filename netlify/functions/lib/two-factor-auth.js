import speakeasy from 'speakeasy'
import QRCode from 'qrcode'
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

export const setup2FA = async (contractorId, businessName) => {
  try {
    const secret = speakeasy.generateSecret({
      name: `CLM:${businessName}`,
      issuer: 'Custom Lead Match',
      length: 32
    })
    
    const supabaseClient = getSupabaseClient()
    if (!supabaseClient) {
      throw new Error('Database not available')
    }

    const { error } = await supabaseClient
      .from('contractor_2fa')
      .upsert({
        contractor_id: contractorId,
        secret: secret.base32,
        enabled: false
      })
    
    if (error) {
      throw new Error('Failed to store 2FA secret')
    }
    
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url)
    
    return {
      success: true,
      secret: secret.base32,
      qrCode: qrCodeUrl,
      manualEntryKey: secret.base32
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const verify2FA = async (contractorId, token) => {
  try {
    const supabaseClient = getSupabaseClient()
    if (!supabaseClient) {
      return { valid: false, error: 'Database not available' }
    }

    const { data: twoFA, error } = await supabaseClient
      .from('contractor_2fa')
      .select('*')
      .eq('contractor_id', contractorId)
      .single()
    
    if (error || !twoFA) {
      return { valid: false, error: '2FA not set up' }
    }
    
    const verified = speakeasy.totp.verify({
      secret: twoFA.secret,
      encoding: 'base32',
      token: token,
      window: 2
    })
    
    return { valid: verified }
  } catch (error) {
    return { valid: false, error: error.message }
  }
}

export const enable2FA = async (contractorId, token) => {
  try {
    const verification = await verify2FA(contractorId, token)
    if (!verification.valid) {
      return { success: false, error: 'Invalid 2FA token' }
    }
    
    const backupCodes = Array.from({ length: 10 }, () => 
      Math.random().toString(36).substring(2, 10).toUpperCase()
    )
    
    const supabaseClient = getSupabaseClient()
    if (!supabaseClient) {
      throw new Error('Database not available')
    }

    const { error } = await supabaseClient
      .from('contractor_2fa')
      .update({
        enabled: true,
        backup_codes: backupCodes
      })
      .eq('contractor_id', contractorId)
    
    if (error) {
      throw new Error('Failed to enable 2FA')
    }
    
    return { success: true, backupCodes }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const verifyBackupCode = async (contractorId, code) => {
  try {
    const supabaseClient = getSupabaseClient()
    if (!supabaseClient) {
      return { valid: false, error: 'Database not available' }
    }

    const { data: twoFA, error } = await supabaseClient
      .from('contractor_2fa')
      .select('*')
      .eq('contractor_id', contractorId)
      .single()
    
    if (error || !twoFA || !twoFA.enabled) {
      return { valid: false, error: '2FA not enabled' }
    }
    
    const backupCodes = twoFA.backup_codes || []
    const codeIndex = backupCodes.indexOf(code.toUpperCase())
    
    if (codeIndex === -1) {
      return { valid: false, error: 'Invalid backup code' }
    }
    
    const updatedCodes = backupCodes.filter((_, index) => index !== codeIndex)
    
    await supabaseClient
      .from('contractor_2fa')
      .update({ backup_codes: updatedCodes })
      .eq('contractor_id', contractorId)
    
    return { valid: true }
  } catch (error) {
    return { valid: false, error: error.message }
  }
}
