import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export const handler = async (event, context) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json'
  }

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    }
  }

  try {
    console.log('Adding price_paid column to contractor_leads table...')
    
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE contractor_leads ADD COLUMN IF NOT EXISTS price_paid DECIMAL(10,2);
        CREATE INDEX IF NOT EXISTS idx_contractor_leads_price_paid ON contractor_leads(price_paid);
      `
    })

    if (alterError) {
      console.error('Error adding price_paid column:', alterError)
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ 
          success: false, 
          error: 'Failed to add price_paid column',
          details: alterError.message 
        })
      }
    }

    console.log('Successfully added price_paid column to contractor_leads table')

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        message: 'price_paid column added successfully to contractor_leads table'
      })
    }
  } catch (error) {
    console.error('Migration error:', error)
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        success: false, 
        error: 'Migration failed', 
        details: error.message 
      })
    }
  }
}
