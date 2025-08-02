import { createClient } from '@supabase/supabase-js'
import bcryptjs from 'bcryptjs'
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
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
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
    const { access_token, refresh_token, new_password, user_type } = JSON.parse(event.body)

    if (!access_token || !new_password || !user_type) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ success: false, message: 'Missing required fields' })
      }
    }

    const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
      access_token,
      refresh_token
    })

    if (sessionError || !sessionData.user) {
      console.error('Session error:', sessionError)
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ success: false, message: 'Invalid or expired reset token' })
      }
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: new_password
    })

    if (updateError) {
      console.error('Password update error:', updateError)
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ success: false, message: 'Failed to update password' })
      }
    }

    const userEmail = sessionData.user.email

    if (user_type === 'contractor' && userEmail) {
      const saltRounds = 12
      const password_hash = await bcryptjs.hash(new_password, saltRounds)

      const { error: contractorUpdateError } = await supabase
        .from('contractors')
        .update({ password_hash })
        .eq('email', userEmail)

      if (contractorUpdateError) {
        console.error('Contractor password update error:', contractorUpdateError)
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'Password updated successfully'
      })
    }
  } catch (error) {
    console.error('Error in reset password:', error)
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
