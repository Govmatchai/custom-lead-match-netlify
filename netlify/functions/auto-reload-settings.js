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
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      }
    }
  }

  try {
    if (event.httpMethod === 'GET') {
      const { contractor_id } = event.queryStringParameters || {}

      if (!contractor_id) {
        return {
          statusCode: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ detail: 'contractor_id is required' })
        }
      }

      const { data: contractor, error } = await supabase
        .from('contractors')
        .select('auto_reload_enabled, auto_reload_threshold, auto_reload_amount')
        .eq('id', contractor_id)
        .single()

      if (error) {
        console.error('Error fetching auto-reload settings:', error)
        return {
          statusCode: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ detail: 'Failed to fetch auto-reload settings' })
        }
      }

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          auto_reload_enabled: contractor.auto_reload_enabled || false,
          auto_reload_threshold: contractor.auto_reload_threshold || 20.00,
          auto_reload_amount: contractor.auto_reload_amount || 100.00
        })
      }
    }

    if (event.httpMethod === 'POST') {
      const { contractor_id, auto_reload_enabled, auto_reload_threshold, auto_reload_amount, session_token } = JSON.parse(event.body)

      if (!contractor_id || !session_token) {
        return {
          statusCode: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ detail: 'contractor_id and session_token are required' })
        }
      }

      const { data: session, error: sessionError } = await supabase
        .from('contractor_sessions')
        .select('*')
        .eq('session_token', session_token)
        .eq('contractor_id', contractor_id)
        .gt('expires_at', new Date().toISOString())
        .single()

      if (sessionError || !session) {
        return {
          statusCode: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ detail: 'Invalid or expired session' })
        }
      }

      const updateData = {}
      
      if (auto_reload_enabled !== undefined) {
        updateData.auto_reload_enabled = auto_reload_enabled
      }
      
      if (auto_reload_threshold !== undefined) {
        const threshold = parseFloat(auto_reload_threshold)
        if (threshold < 10 || threshold > 500) {
          return {
            statusCode: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ detail: 'Auto-reload threshold must be between $10 and $500' })
          }
        }
        updateData.auto_reload_threshold = threshold
      }
      
      if (auto_reload_amount !== undefined) {
        const amount = parseFloat(auto_reload_amount)
        if (amount < 100 || amount > 1000) {
          return {
            statusCode: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ detail: 'Auto-reload amount must be between $100 and $1000' })
          }
        }
        updateData.auto_reload_amount = amount
      }

      const { error: updateError } = await supabase
        .from('contractors')
        .update(updateData)
        .eq('id', contractor_id)

      if (updateError) {
        console.error('Error updating auto-reload settings:', updateError)
        return {
          statusCode: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ detail: 'Failed to update auto-reload settings' })
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
          message: 'Auto-reload settings updated successfully',
          settings: updateData
        })
      }
    }

    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ detail: 'Method not allowed' })
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
