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
    const schemaUpdates = [
      `CREATE TABLE IF NOT EXISTS pricing_history (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        admin_id VARCHAR(255),
        category VARCHAR(100) NOT NULL,
        lead_type VARCHAR(50) DEFAULT 'standard',
        old_price DECIMAL(10,2),
        new_price DECIMAL(10,2) NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        notes TEXT
      );`,
      
      `CREATE INDEX IF NOT EXISTS idx_pricing_history_category ON pricing_history(category);`,
      `CREATE INDEX IF NOT EXISTS idx_pricing_history_timestamp ON pricing_history(timestamp);`,
      `CREATE INDEX IF NOT EXISTS idx_pricing_history_admin_id ON pricing_history(admin_id);`,
      
      `ALTER TABLE pricing_history ENABLE ROW LEVEL SECURITY;`,
      `DROP POLICY IF EXISTS "Allow all for service role" ON pricing_history;`,
      `CREATE POLICY "Allow all for service role" ON pricing_history FOR ALL USING (auth.role() = 'service_role');`,
      `DROP POLICY IF EXISTS "Allow anonymous read" ON pricing_history;`,
      `CREATE POLICY "Allow anonymous read" ON pricing_history FOR SELECT USING (true);`,
      
      `INSERT INTO category_pricing (category, price) VALUES 
       ('HVAC', 20.00),
       ('Plumbing', 25.00),
       ('Electrical', 30.00),
       ('Roofing', 35.00)
       ON CONFLICT (category) DO UPDATE SET 
         price = EXCLUDED.price,
         updated_at = NOW();`
    ]

    const results = []
    
    for (const sql of schemaUpdates) {
      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })
        if (error) {
          console.error(`Error executing SQL: ${sql}`, error)
          results.push({ sql: sql.substring(0, 50) + '...', success: false, error: error.message })
        } else {
          results.push({ sql: sql.substring(0, 50) + '...', success: true })
        }
      } catch (err) {
        console.error(`Exception executing SQL: ${sql}`, err)
        results.push({ sql: sql.substring(0, 50) + '...', success: false, error: err.message })
      }
    }

    const successCount = results.filter(r => r.success).length
    const totalCount = results.length

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: `Pricing schema migration completed: ${successCount}/${totalCount} operations successful`,
        results
      })
    }
  } catch (error) {
    console.error('Error applying pricing schema migration:', error)
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ detail: 'Internal server error', error: error.message })
    }
  }
}
