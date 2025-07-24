import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '../../.env' })

export const handler = async (event, context) => {
  console.log('=== CONTRACTORS SIGNUP SUPABASE CLIENT TEST ===')
  console.log('Event:', event.httpMethod)
  
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

  try {
    console.log('Environment variables check:')
    console.log('SUPABASE_URL exists:', !!process.env.SUPABASE_URL)
    console.log('SUPABASE_SERVICE_KEY exists:', !!process.env.SUPABASE_SERVICE_KEY)
    
    console.log('Creating Supabase client...')
    const supabase = createClient(
      process.env.SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.SUPABASE_SERVICE_KEY || 'placeholder-key'
    )
    console.log('Supabase client created successfully')

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'Supabase client initialization test successful',
        method: event.httpMethod,
        hasBody: !!event.body,
        envVarsPresent: {
          supabaseUrl: !!process.env.SUPABASE_URL,
          supabaseKey: !!process.env.SUPABASE_SERVICE_KEY
        }
      })
    }
  } catch (error) {
    console.error('Error in Supabase client test:', error)
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        success: false,
        error: error.message,
        detail: 'Supabase client initialization failed'
      })
    }
  }
}
