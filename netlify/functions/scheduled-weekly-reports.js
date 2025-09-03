import { createClient } from '@supabase/supabase-js'
import { handler as generateReports } from './generate-weekly-reports.js'
import dotenv from 'dotenv'

dotenv.config({ path: '../../.env' })

export const handler = async (event, context) => {
  try {
    console.log('Scheduled weekly reports triggered')
    
    const result = await generateReports(event, context)
    
    return result
  } catch (error) {
    console.error('Error in scheduled weekly reports:', error)
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        message: 'Failed to run scheduled weekly reports',
        error: error.message
      })
    }
  }
}
