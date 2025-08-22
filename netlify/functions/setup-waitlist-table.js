import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export const handler = async (event, context) => {
  try {
    const { data: testData, error: insertError } = await supabase
      .from('contractors_waitlist')
      .insert({
        first_name: 'Test',
        last_name: 'User',
        company: 'Test Company',
        email: `test-${Date.now()}@example.com`,
        phone: '555-123-4567',
        trade: 'plumbing',
        launch_notified: false
      })
      .select()

    if (insertError) {
      if (insertError.code === '42P01') {
        return {
          statusCode: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ 
            success: false, 
            error: 'contractors_waitlist table does not exist. Please create it manually in your Supabase dashboard using the SQL from database/contractors-waitlist-table.sql',
            code: insertError.code
          })
        }
      }
      
      console.error('Insert test error:', insertError)
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          success: false, 
          error: insertError.message,
          code: insertError.code
        })
      }
    }

    const { data: selectData, error: selectError } = await supabase
      .from('contractors_waitlist')
      .select('*')
      .eq('launch_notified', false)
      .limit(5)

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        success: true, 
        message: 'Table exists and is accessible',
        testInsert: testData ? 'success' : 'failed',
        testData: testData,
        waitlistCount: selectData?.length || 0,
        selectError: selectError?.message
      })
    }
  } catch (error) {
    console.error('Setup error:', error)
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
