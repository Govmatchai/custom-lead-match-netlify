import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export const handler = async (event, context) => {
  try {
    const { data, error } = await supabase.rpc('exec', {
      sql: `
        ALTER TABLE contractors_waitlist 
        ADD COLUMN IF NOT EXISTS launch_notified BOOLEAN DEFAULT false;
        
        UPDATE contractors_waitlist 
        SET launch_notified = false 
        WHERE launch_notified IS NULL;
      `
    })

    if (error) {
      console.error('RPC exec error:', error)
      
      const { data: testData, error: testError } = await supabase
        .from('contractors_waitlist')
        .select('launch_notified')
        .limit(1)

      if (testError && testError.code === '42703') {
        return {
          statusCode: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ 
            success: false, 
            error: 'launch_notified column does not exist and cannot be added via function. Please add manually in Supabase dashboard: ALTER TABLE contractors_waitlist ADD COLUMN launch_notified BOOLEAN DEFAULT false;',
            code: testError.code
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
          message: 'launch_notified column already exists',
          testQuery: testData ? 'success' : 'no data'
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
        message: 'launch_notified column added successfully',
        data: data
      })
    }
  } catch (error) {
    console.error('Column addition error:', error)
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ success: false, error: error.message })
    }
  }
}
