import { sendEmail } from './lib/sendgrid.js'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '../../.env' })

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

export const sendInactiveContractorEmail = async (contractor) => {
  const emailSubject = 'Action Required: Reactivate Your SMS Alerts on Custom Lead Match'
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Action Required: Reactivate Your SMS Alerts</h2>
      <p>Hi ${contractor.contact_name || contractor.business_name},</p>
      <p>We noticed you haven't logged in or interacted with recent leads, and your account has been temporarily removed from our SMS alert system.</p>
      <p>To continue receiving new, high-quality leads via SMS, simply log in and add funds to your account:</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="https://customleadmatch.netlify.app/contractor-login" style="background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">👉 Log In and Reactivate</a>
      </p>
      <p>If you believe this was a mistake or need help reactivating your alerts, reply to this message and we'll assist you right away.</p>
      <p>Thank you,<br>The Custom Lead Match Team</p>
    </div>
  `

  try {
    await sendEmail(contractor.email, emailSubject, emailHtml)
    
    await supabase
      .from('contractor_activity_log')
      .insert({
        contractor_id: contractor.id,
        event_type: 'inactive_notification_sent',
        event_data: {
          reason: 'inactivity_auto_disable',
          email_sent: true
        }
      })
    
    return { success: true }
  } catch (error) {
    console.error('Error sending inactive contractor email:', error)
    return { success: false, error: error.message }
  }
}

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

  try {
    const { contractor_id } = JSON.parse(event.body || '{}')
    
    if (!contractor_id) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'contractor_id is required' })
      }
    }

    const { data: contractor, error } = await supabase
      .from('contractors')
      .select('*')
      .eq('id', contractor_id)
      .single()

    if (error || !contractor) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Contractor not found' })
      }
    }

    const result = await sendInactiveContractorEmail(contractor)

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(result)
    }
  } catch (error) {
    console.error('Handler error:', error)
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Internal server error' })
    }
  }
}
