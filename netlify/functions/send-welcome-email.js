import { createClient } from '@supabase/supabase-js'
import { sendEmail } from './lib/sendgrid.js'
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

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ success: false, message: 'Method not allowed' })
    }
  }

  try {
    const { contractor_id, email, name, business_name } = JSON.parse(event.body)

    if (!contractor_id || !email || !name) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ success: false, message: 'Missing required fields' })
      }
    }

    const loginToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    const { error: tokenError } = await supabase
      .from('contractor_login_tokens')
      .insert({
        contractor_id: contractor_id,
        token: loginToken,
        expires_at: expiresAt.toISOString(),
        used: false
      })

    if (tokenError) {
      console.error('Token creation error:', tokenError)
    }

    const dashboardUrl = `${process.env.URL || 'https://customleadmatch.netlify.app'}/contractor-login?token=${loginToken}`
    
    const emailContent = {
      to: email,
      from: 'Custom Lead Match Team <noreply@customleadmatch.com>',
      subject: 'Welcome to Custom Lead Match!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <p>Hi ${name},</p>
          
          <p>Welcome to Custom Lead Match — we're excited to have you on board!</p>
          
          <p>As part of our trusted contractor network, you'll start receiving high-quality, pre-screened leads tailored to your business.</p>
          
          <p>🎁 Your first 3 leads are absolutely FREE.</p>
          
          <p>🔐 Log into your dashboard anytime to view available leads, track claims, and manage your preferences:</p>
          
          <p>👉 <a href="${dashboardUrl}" style="color: #2563eb; text-decoration: none; font-weight: bold;">Dashboard Login</a></p>
          
          <p>You'll also receive SMS alerts when new leads match your selected industry and location.</p>
          
          <p>Thanks again for joining!</p>
          
          <p>— The Custom Lead Match Team</p>
        </div>
      `
    }

    console.log('📧 Send welcome email: Email content prepared')
    console.log('📧 Send welcome email timestamp:', new Date().toISOString())
    console.log('📧 Send welcome email to:', email)
    console.log('📧 Send welcome email subject:', emailContent.subject)
    
    const emailResult = await sendEmail(email, emailContent.subject, emailContent.html);
    console.log('📧 Send welcome email result:', emailResult);
    console.log('✅ Welcome email completion timestamp:', new Date().toISOString());

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: emailResult.success,
        message: emailResult.success ? 'Welcome email sent successfully' : 'Welcome email failed to send',
        dashboard_url: dashboardUrl,
        email_result: emailResult
      })
    }
  } catch (error) {
    console.error('Error sending welcome email:', error)
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ success: false, message: 'Failed to send welcome email' })
    }
  }
}
