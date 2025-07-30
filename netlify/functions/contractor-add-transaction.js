import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '../../.env' })
dotenv.config({ path: '.env' })

const requiredEnvVars = {
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY
}

console.log('contractor-add-transaction environment variables check:', {
  SUPABASE_URL: requiredEnvVars.SUPABASE_URL ? 'SET' : 'MISSING',
  SUPABASE_SERVICE_KEY: requiredEnvVars.SUPABASE_SERVICE_KEY ? 'SET' : 'MISSING'
})

const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value)
  .map(([key]) => key)

if (missingVars.length > 0) {
  console.error('contractor-add-transaction missing required environment variables:', missingVars)
}

const supabase = createClient(
  requiredEnvVars.SUPABASE_URL,
  requiredEnvVars.SUPABASE_SERVICE_KEY
)

export const handler = async (event, context) => {
  console.log('contractor-add-transaction handler started:', {
    httpMethod: event.httpMethod,
    headers: Object.keys(event.headers || {}),
    hasBody: !!event.body,
    bodyLength: event.body ? event.body.length : 0
  })

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
    console.log('Non-POST request received:', event.httpMethod)
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
    if (missingVars.length > 0) {
      console.error('Cannot process transaction due to missing environment variables:', missingVars)
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          detail: 'Server configuration error',
          missingVars: missingVars
        })
      }
    }

    console.log('Parsing request body...')
    const data = JSON.parse(event.body)
    const { contractor_id, amount, source, notes } = data

    console.log('Parsed transaction data:', {
      contractor_id,
      amount,
      source,
      notes,
      amountType: typeof amount
    })

    if (!contractor_id || amount === undefined || !source) {
      console.log('Missing required fields:', {
        hasContractorId: !!contractor_id,
        hasAmount: amount !== undefined,
        hasSource: !!source
      })
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ detail: 'contractor_id, amount, and source are required' })
      }
    }

    const transactionData = {
      contractor_id,
      amount: parseFloat(amount),
      source,
      notes: notes || null
    }

    console.log('Inserting transaction data:', transactionData)

    const { data: transaction, error } = await supabase
      .from('transactions')
      .insert(transactionData)
      .select()
      .single()

    if (error) {
      console.error('Transaction insertion error:', {
        error,
        errorCode: error.code,
        errorMessage: error.message,
        errorDetails: error.details,
        errorHint: error.hint,
        transactionData
      })
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          detail: 'Failed to add transaction',
          error: error.message,
          errorCode: error.code
        })
      }
    }

    console.log('Transaction inserted successfully:', transaction)
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ transaction })
    }
  } catch (error) {
    console.error('Exception in contractor-add-transaction:', {
      error: error.message,
      stack: error.stack,
      name: error.name,
      cause: error.cause
    })
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        detail: 'Internal server error',
        error: error.message,
        timestamp: new Date().toISOString()
      })
    }
  }
}
