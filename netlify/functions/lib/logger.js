import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '../../.env' })

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

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
