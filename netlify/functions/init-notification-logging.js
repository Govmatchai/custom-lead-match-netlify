import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

dotenv.config({ path: '../../.env' })

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export async function initNotificationLogging() {
  try {
    console.log('🔧 Initializing notification logging table...')
    
    const sqlPath = join(__dirname, '../../database/auto-create-notification-logs.sql')
    const sql = readFileSync(sqlPath, 'utf8')
    
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
