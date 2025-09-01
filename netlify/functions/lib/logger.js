import { createClient } from '@supabase/supabase-js'
import { initNotificationLogging } from '../init-notification-logging.js'
import dotenv from 'dotenv'

dotenv.config({ path: '../../.env' })

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

let tableInitialized = false
async function ensureTableExists() {
  if (!tableInitialized) {
    try {
      console.log('🔧 Ensuring notification_logs table exists...')
      
      const { error } = await supabase.rpc('exec_sql', {
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
          CREATE INDEX IF NOT EXISTS idx_notification_logs_contractor_id ON notification_logs(contractor_id);

          ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

          DROP POLICY IF EXISTS "Service role can manage notification logs" ON notification_logs;
          CREATE POLICY "Service role can manage notification logs" ON notification_logs
            FOR ALL USING (true);

          GRANT ALL ON notification_logs TO service_role;
          GRANT USAGE, SELECT ON SEQUENCE notification_logs_id_seq TO service_role;
        `
      })

      if (error) {
        console.log('Table creation via RPC failed, trying direct approach:', error.message)
        
        const { error: testError } = await supabase
          .from('notification_logs')
          .select('id')
          .limit(1)

        if (testError && testError.code === '42P01') {
          console.log('Table does not exist, creating manually...')
          console.log('⚠️ Using fallback logging to leads table')
        } else {
          console.log('✅ notification_logs table already exists')
        }
      } else {
        console.log('✅ notification_logs table initialized successfully')
      }
      
      tableInitialized = true
    } catch (error) {
      console.error('❌ Failed to initialize notification_logs table:', error.message)
      tableInitialized = true // Don't keep retrying
    }
  }
}

export class ProductionLogger {
  constructor(functionName) {
    this.functionName = functionName
    this.logs = []
  }

  async log(level, message, context = {}, leadId = null, contractorId = null, email = null) {
    const timestamp = new Date().toISOString()
    const logMessage = `[${level}] ${this.functionName}: ${message}`
    
    if (level === 'ERROR') {
      console.error(logMessage, context)
    } else {
      console.log(logMessage, context)
    }

    this.logs.push({
      timestamp,
      level,
      message,
      context,
      function_name: this.functionName,
      lead_id: leadId,
      contractor_id: contractorId,
      email
    })

    try {
      await ensureTableExists()
      
      await supabase
        .from('notification_logs')
        .insert({
          level,
          message,
          context,
          function_name: this.functionName,
          lead_id: leadId,
          contractor_id: contractorId,
          email
        })
    } catch (dbError) {
      console.error('Failed to log to database:', dbError.message)
      try {
        await supabase
          .from('leads')
          .update({ 
            notes: `${timestamp} [${level}] ${this.functionName}: ${message} | ${JSON.stringify(context)}` 
          })
          .eq('id', leadId || -1)
      } catch (fallbackError) {
        console.error('Fallback logging also failed:', fallbackError.message)
      }
    }
  }

  async info(message, context = {}, leadId = null, contractorId = null, email = null) {
    await this.log('INFO', message, context, leadId, contractorId, email)
  }

  async error(message, context = {}, leadId = null, contractorId = null, email = null) {
    await this.log('ERROR', message, context, leadId, contractorId, email)
  }

  async debug(message, context = {}, leadId = null, contractorId = null, email = null) {
    await this.log('DEBUG', message, context, leadId, contractorId, email)
  }

  getLogsAsHeaders() {
    const headers = {}
    this.logs.forEach((log, index) => {
      headers[`X-Debug-Log-${index}`] = `${log.timestamp} [${log.level}] ${log.function_name}: ${log.message}`
    })
    return headers
  }

  getLogsAsString() {
    return this.logs.map(log => 
      `${log.timestamp} [${log.level}] ${log.function_name}: ${log.message}`
    ).join('\n')
  }
}

export async function getRecentLogs(limit = 50) {
  try {
    const { data, error } = await supabase
      .from('notification_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  } catch (error) {
    console.error('Failed to fetch logs:', error.message)
    return []
  }
}
