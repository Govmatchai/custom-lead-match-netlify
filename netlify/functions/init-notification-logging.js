import { createClient } from '@supabase/supabase-js'


const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export async function initNotificationLogging() {
  try {
    console.log('🔧 Initializing notification logging table...')
    
    const sql = `
      CREATE TABLE IF NOT EXISTS notification_logs (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMPTZ DEFAULT NOW(),
        level VARCHAR(20) NOT NULL,
        message TEXT NOT NULL,
        context JSONB DEFAULT '{}',
        function_name VARCHAR(100),
        lead_id INTEGER,
        contractor_id INTEGER,
        email VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_notification_logs_timestamp ON notification_logs(timestamp);
      CREATE INDEX IF NOT EXISTS idx_notification_logs_level ON notification_logs(level);
      CREATE INDEX IF NOT EXISTS idx_notification_logs_function ON notification_logs(function_name);
      CREATE INDEX IF NOT EXISTS idx_notification_logs_lead_id ON notification_logs(lead_id);
      CREATE INDEX IF NOT EXISTS idx_notification_logs_contractor_id ON notification_logs(contractor_id);

      ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS "Service role can manage notification logs" ON notification_logs;
      CREATE POLICY "Service role can manage notification logs" ON notification_logs
        FOR ALL USING (true);

      GRANT ALL ON notification_logs TO service_role;
      GRANT USAGE, SELECT ON SEQUENCE notification_logs_id_seq TO service_role;
    `
    
    const { error } = await supabase.rpc('exec_sql', { sql })
    
    if (error) {
      console.error('❌ Failed to initialize notification_logs table:', error)
      return { success: false, error: error.message }
    }
    
    console.log('✅ Notification logging table initialized successfully')
    return { success: true }
  } catch (error) {
    console.error('❌ Error initializing notification logging:', error)
    return { success: false, error: error.message }
  }
}

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

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ detail: 'Method not allowed' })
    }
  }

  const result = await initNotificationLogging()
  
  return {
    statusCode: result.success ? 200 : 500,
    headers: corsHeaders,
    body: JSON.stringify(result)
  }
}
