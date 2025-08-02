import { createClient } from '@supabase/supabase-js'
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
    const { email, user_type, redirect_url } = JSON.parse(event.body)

    if (!email || !user_type) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ success: false, message: 'Email and user type are required' })
      }
    }

    let userExists = false
    
    if (user_type === 'contractor') {
      const { data: contractor, error } = await supabase
        .from('contractors')
        .select('id, email')
        .eq('email', email)
        .single()

      if (contractor && !error) {
        userExists = true
        
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: email,
          password: Math.random().toString(36).slice(-12),
          email_confirm: true
        })

        if (authError && authError.message !== 'User already registered') {
          console.error('Error creating auth user:', authError)
        }
      }
    } else if (user_type === 'admin') {
      if (email === 'admin@customleadmatch.com') {
        userExists = true
        
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: email,
          password: Math.random().toString(36).slice(-12),
          email_confirm: true
        })

        if (authError && authError.message !== 'User already registered') {
          console.error('Error creating auth user:', authError)
        }
      }
    }

    if (!userExists) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          success: false, 
          message: 'No account found with this email address' 
        })
      }
    }

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirect_url
    })

    if (resetError) {
      console.error('Password reset error:', resetError)
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          success: false, 
          message: 'Failed to send reset email' 
        })
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
        message: 'Password reset email sent successfully'
      })
    }
  } catch (error) {
    console.error('Error in forgot password:', error)
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
