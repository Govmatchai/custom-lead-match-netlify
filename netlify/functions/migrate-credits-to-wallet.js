import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '../../.env' })

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export const handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
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
    const { data: contractors, error: contractorsError } = await supabase
      .from('contractors')
      .select('id, lead_credits')
      .gt('lead_credits', 0)

    if (contractorsError) {
      console.error('Failed to fetch contractors:', contractorsError)
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ detail: 'Failed to fetch contractors' })
      }
    }

    const migrations = []
    for (const contractor of contractors) {
      const dollarAmount = contractor.lead_credits * 10.00
      
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          contractor_id: contractor.id,
          amount: dollarAmount,
          source: 'manual',
          notes: `Migration from ${contractor.lead_credits} lead credits to wallet balance`
        })

      if (transactionError) {
        console.error(`Failed to migrate contractor ${contractor.id}:`, transactionError)
      } else {
        migrations.push({ contractor_id: contractor.id, amount: dollarAmount })
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        message: `Migrated ${migrations.length} contractors`,
        migrations 
      })
    }
  } catch (error) {
    console.error('Migration error:', error)
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ detail: 'Migration failed' })
    }
  }
}
