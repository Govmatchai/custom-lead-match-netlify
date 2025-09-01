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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ detail: 'Method not allowed' })
    }
  }

  try {
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
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

        ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Service role can manage notification logs" ON notification_logs;
        CREATE POLICY "Service role can manage notification logs" ON notification_logs
          FOR ALL USING (true);
      `
    })

    if (createError) {
      console.error('Setup error:', createError)
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ detail: 'Failed to setup table', error: createError.message })
      }
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Notification logs table setup complete' })
    }
  } catch (error) {
    console.error('Handler error:', error)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ detail: 'Internal server error', error: error.message })
    }
  }
}
