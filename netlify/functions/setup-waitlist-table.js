import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export const handler = async (event, context) => {
  try {
    const { data, error } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS contractors_waitlist (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          first_name VARCHAR(255) NOT NULL,
          last_name VARCHAR(255) NOT NULL,
          company VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          phone VARCHAR(20) NOT NULL,
          trade VARCHAR(100) NOT NULL,
          signup_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_contractors_waitlist_email ON contractors_waitlist(email);
        CREATE INDEX IF NOT EXISTS idx_contractors_waitlist_trade ON contractors_waitlist(trade);
        CREATE INDEX IF NOT EXISTS idx_contractors_waitlist_signup_date ON contractors_waitlist(signup_date);

        ALTER TABLE contractors_waitlist ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Allow all for service role" ON contractors_waitlist;
        CREATE POLICY "Allow all for service role" ON contractors_waitlist FOR ALL USING (auth.role() = 'service_role');
        
        DROP POLICY IF EXISTS "Allow anonymous read" ON contractors_waitlist;
        CREATE POLICY "Allow anonymous read" ON contractors_waitlist FOR SELECT USING (true);
      `
    })

    if (error) {
      console.error('Table creation error:', error)
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ success: false, error: error.message })
      }
    }

    const { data: testData, error: insertError } = await supabase
      .from('contractors_waitlist')
      .insert({
        first_name: 'Test',
        last_name: 'User',
        company: 'Test Company',
        email: 'test@example.com',
        phone: '555-123-4567',
        trade: 'plumbing'
      })
      .select()

    if (insertError) {
      console.error('Insert test error:', insertError)
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        success: true, 
        message: 'Table created successfully',
        testInsert: testData ? 'success' : 'failed',
        insertError: insertError?.message
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
