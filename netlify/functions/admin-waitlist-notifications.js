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
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      }
    }
  }

  try {
    const { action, notification_type } = JSON.parse(event.body || '{}')

    if (action === 'send_notifications') {
      const { data: waitlistEntries, error } = await supabase
        .from('contractors_waitlist')
        .select('*')
        .eq('launch_notified', false)

      if (error) {
        console.error('Error fetching waitlist entries:', error)
        return {
          statusCode: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({ success: false, message: 'Failed to fetch waitlist entries' })
        }
      }

      const emailFunction = notification_type === 'launching_soon' ? 'email-launching-soon' : 'email-launch-day'
      let successCount = 0
      let errorCount = 0

      for (const entry of waitlistEntries) {
        try {
          const emailResponse = await fetch(`${process.env.URL || 'https://customleadmatch.netlify.app'}/.netlify/functions/${emailFunction}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: entry.email,
              first_name: entry.first_name,
              company: entry.company,
              trade: entry.trade
            })
          })

          if (emailResponse.ok) {
            successCount++
            if (notification_type === 'launch_day') {
              await supabase
                .from('contractors_waitlist')
                .update({ launch_notified: true })
                .eq('id', entry.id)
            }
          } else {
            errorCount++
            console.error(`Failed to send email to ${entry.email}`)
          }
        } catch (emailError) {
          errorCount++
          console.error(`Email error for ${entry.email}:`, emailError)
        }
      }

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({
          success: true,
          message: `Sent ${successCount} emails, ${errorCount} errors`,
          total_sent: successCount,
          total_errors: errorCount
        })
      }
    }

    if (action === 'export_waitlist') {
      const { data: waitlistEntries, error } = await supabase
        .from('contractors_waitlist')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        return {
          statusCode: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({ success: false, message: 'Failed to fetch waitlist entries' })
        }
      }

      const csv = [
        'First Name,Last Name,Company,Email,Phone,Trade,Launch Notified,Signup Date',
        ...waitlistEntries.map(entry => 
          `${entry.first_name},${entry.last_name},${entry.company},${entry.email},${entry.phone},${entry.trade},${entry.launch_notified},${entry.created_at}`
        )
      ].join('\n')

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Access-Control-Allow-Origin': '*',
          'Content-Disposition': 'attachment; filename="waitlist.csv"'
        },
        body: csv
      }
    }

    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: false, message: 'Invalid action' })
    }
  } catch (error) {
    console.error('Error in waitlist notifications:', error)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: false, message: 'Failed to process request' })
    }
  }
}
