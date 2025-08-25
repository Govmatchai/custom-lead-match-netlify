import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

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
        'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS'
      }
    }
  }

  try {
    if (event.httpMethod === 'GET') {
      const { data: configs, error } = await supabase
        .from('sms_config')
        .select('*')
        .order('config_key')

      if (error) {
        console.error('Error fetching SMS config:', error)
        return {
          statusCode: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ detail: 'Failed to fetch SMS configuration' })
        }
      }

      const configObject = {}
      configs.forEach(config => {
        configObject[config.config_key] = config.config_value
      })

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ configs: configObject })
      }
    }

    if (event.httpMethod === 'PUT') {
      const { config_key, config_value } = JSON.parse(event.body)

      if (!config_key || !config_value) {
        return {
          statusCode: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ detail: 'config_key and config_value are required' })
        }
      }

      const { data, error } = await supabase
        .from('sms_config')
        .upsert({
          config_key,
          config_value,
          updated_at: new Date().toISOString()
        })
        .select()

      if (error) {
        console.error('Error updating SMS config:', error)
        return {
          statusCode: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ detail: 'Failed to update SMS configuration' })
        }
      }

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ message: 'SMS configuration updated successfully', data })
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
    console.error('Error in SMS config handler:', error)
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
