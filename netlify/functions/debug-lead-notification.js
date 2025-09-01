import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export const handler = async (event, context) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, Pragma',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'false',
    'Access-Control-Expose-Headers': 'X-Debug-Log-0, X-Debug-Log-1, X-Debug-Log-2, X-Debug-Log-3, X-Debug-Log-4, X-Debug-Log-5',
    'Content-Type': 'application/json',
    'Vary': 'Origin'
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

  try {
    const { test_type, contractor_email, lead_id } = JSON.parse(event.body || '{}')
    
    console.log(`🔧 Debug lead notification endpoint called:`)
    console.log(`   Timestamp: ${new Date().toISOString()}`)
    console.log(`   Test type: ${test_type}`)
    console.log(`   Contractor email: ${contractor_email}`)
    console.log(`   Lead ID: ${lead_id}`)

    if (test_type === 'direct_email') {
      console.log(`🔧 Testing direct email sending...`)
      
      const testEmailSubject = 'Test Lead Notification - Debug Mode'
      const testEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Debug Test: Lead Notification</h2>
          <p>This is a test email to verify SendGrid integration for lead notifications.</p>
          <p><strong>Test timestamp:</strong> ${new Date().toISOString()}</p>
          <p><strong>Test type:</strong> Direct email sending</p>
          <p>If you receive this email, the SendGrid integration is working correctly.</p>
        </div>
      `
      
      const sgMail = await import('@sendgrid/mail')
      
      if (!process.env.SENDGRID_API_KEY || 
          process.env.SENDGRID_API_KEY === 'your_sendgrid_api_key_here' ||
          !process.env.SENDGRID_API_KEY.startsWith('SG.')) {
        console.log(`⚠️ SendGrid not configured, skipping email to ${contractor_email}`)
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({
            test_type: 'direct_email',
            success: false,
            error: 'SendGrid API key not configured',
            timestamp: new Date().toISOString()
          })
        }
      }

      sgMail.default.setApiKey(process.env.SENDGRID_API_KEY)
      
      const msg = {
        to: contractor_email,
        from: 'Custom Lead Match Team <noreply@customleadmatch.com>',
        subject: testEmailSubject,
        html: testEmailHtml,
      }

      try {
        const result = await sgMail.default.send(msg)
        console.log(`✅ Debug email sent successfully to ${contractor_email}`)
        const emailResult = { success: true, statusCode: result[0]?.statusCode }
      } catch (error) {
        console.error(`❌ Debug email failed to ${contractor_email}:`, error.message)
        const emailResult = { success: false, error: error.message }
      }
      
      console.log(`🔧 Direct email test result:`, emailResult)
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          test_type: 'direct_email',
          success: emailResult.success,
          result: emailResult,
          timestamp: new Date().toISOString()
        })
      }
    }
    
    if (test_type === 'full_notification_flow') {
      return {
        statusCode: 501,
        headers: corsHeaders,
        body: JSON.stringify({ detail: 'Full notification flow test temporarily disabled to avoid module resolution errors' })
      }
    }
    
    if (test_type === 'welcome_email_comparison') {
      console.log(`🔧 Testing welcome email comparison...`)
      
      const welcomeEmailSubject = 'Welcome to Custom Lead Match!'
      const welcomeEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Custom Lead Match!</h2>
          <p>Hi there,</p>
          
          <p>Welcome to Custom Lead Match — we're excited to have you on board!</p>
          
          <p>As part of our trusted contractor network, you'll start receiving high-quality, pre-screened leads tailored to your business.</p>
          
          <p>🎁 <strong>You've been credited with $25 in your wallet to get started!</strong></p>
          
          <p>🔐 Log into your dashboard anytime to view available leads, track claims, and manage your preferences:</p>
          
          <p style="text-align: center; margin: 30px 0;">
            <a href="https://customleadmatch.netlify.app/contractor-login" style="background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">👉 Access Your Dashboard</a>
          </p>
          
          <p>You'll also receive SMS alerts when new leads match your selected industry and location.</p>
          
          <p>Thanks again for joining!</p>
          
          <p>— The Custom Lead Match Team</p>
          
          <p><strong>Debug info:</strong> This is a welcome email comparison test sent at ${new Date().toISOString()}</p>
        </div>
      `
      
      console.log(`🔧 Sending welcome email comparison test...`)
      const welcomeResult = await sendEmail(contractor_email, welcomeEmailSubject, welcomeEmailHtml)
      
      console.log(`🔧 Welcome email comparison test result:`, welcomeResult)
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          test_type: 'welcome_email_comparison',
          success: welcomeResult.success,
          result: welcomeResult,
          timestamp: new Date().toISOString()
        })
      }
    }
    
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ 
        detail: 'Invalid test_type. Use: direct_email, full_notification_flow, or welcome_email_comparison' 
      })
    }
    
  } catch (error) {
    console.error('🔧 Debug endpoint error:', error)
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ detail: 'Internal server error', error: error.message })
    }
  }
}
