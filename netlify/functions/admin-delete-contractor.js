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
        'Access-Control-Allow-Methods': 'DELETE, OPTIONS'
      }
    }
  }

  if (event.httpMethod !== 'DELETE') {
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
    const data = JSON.parse(event.body)
    const { contractor_id } = data

    if (!contractor_id) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ detail: 'Contractor ID is required' })
      }
    }

    const { error: claimedLeadsError } = await supabase
      .from('leads')
      .update({ claimed_by: null })
      .eq('claimed_by', contractor_id)

    if (claimedLeadsError) {
      console.error('Error updating claimed leads:', claimedLeadsError)
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ detail: 'Failed to update claimed leads' })
      }
    }

    try {
      const { error: purchasedLeadsError } = await supabase
        .from('leads')
        .update({ purchased_by: null })
        .eq('purchased_by', contractor_id)

      if (purchasedLeadsError && !purchasedLeadsError.message.includes("Could not find the 'purchased_by' column")) {
        console.error('Error updating purchased leads:', purchasedLeadsError)
        return {
          statusCode: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ detail: 'Failed to update purchased leads' })
        }
      }
    } catch (err) {
      if (!err.message.includes("purchased_by")) {
        console.error('Error updating purchased leads:', err)
        return {
          statusCode: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ detail: 'Failed to update purchased leads' })
        }
      }
    }

    const { error: dynamicPagesError } = await supabase
      .from('dynamic_pages')
      .update({ contractor_id: null })
      .eq('contractor_id', contractor_id)

    if (dynamicPagesError) {
      console.error('Error updating dynamic pages:', dynamicPagesError)
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ detail: 'Failed to update dynamic pages' })
      }
    }

    const { error: purchasedLeadsDeleteError } = await supabase
      .from('purchased_leads')
      .delete()
      .eq('contractor_id', contractor_id)

    if (purchasedLeadsDeleteError) {
      console.error('Error deleting purchased leads:', purchasedLeadsDeleteError)
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ detail: 'Failed to delete purchased leads' })
      }
    }

    const { error } = await supabase
      .from('contractors')
      .delete()
      .eq('id', contractor_id)

    if (error) {
      console.error('Database delete error:', error)
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ detail: 'Failed to delete contractor' })
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'Contractor deleted successfully'
      })
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
