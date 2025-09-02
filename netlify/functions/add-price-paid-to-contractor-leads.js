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
      body: JSON.stringify({ detail: 'Method not allowed' })
    }
  }

  try {
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE contractor_leads ADD COLUMN IF NOT EXISTS price_paid DECIMAL(10,2);
        
        UPDATE contractor_leads 
        SET price_paid = CASE 
          WHEN leads.service_category = 'HVAC' THEN 20.00
          WHEN leads.service_category = 'Plumbing' THEN 25.00
          WHEN leads.service_category = 'Electrical' THEN 30.00
          ELSE 20.00
        END
        FROM leads 
        WHERE contractor_leads.lead_id = leads.id 
          AND contractor_leads.status = 'purchased' 
          AND contractor_leads.price_paid IS NULL;
      `
    })

    if (alterError) {
      console.error('SQL execution error:', alterError)
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          success: false, 
          error: 'Failed to add price_paid column',
          details: alterError.message 
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
        message: 'Successfully added price_paid column to contractor_leads table' 
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
      body: JSON.stringify({ 
        success: false, 
        error: 'Internal server error',
        details: error.message 
      })
    }
  }
}
