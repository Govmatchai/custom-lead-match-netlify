import { createClient } from '@supabase/supabase-js'
import { notifyContractorsForLead } from './notify-contractors.js'
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
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      }
    }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
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
      
      const emailResult = await sendEmail(contractor_email, testEmailSubject, testEmailHtml)
      
      console.log(`🔧 Direct email test result:`, emailResult)
      
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({
          test_type: 'direct_email',
          success: emailResult.success,
          result: emailResult,
          timestamp: new Date().toISOString()
        })
      }
    }
    
    if (test_type === 'full_notification_flow') {
      console.log(`🔧 Testing full notification flow...`)
      
      if (!lead_id) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({ detail: 'lead_id required for full_notification_flow test' })
        }
      }
      
      const { data: lead, error: leadError } = await supabase
        .from('leads')
        .select('*')
        .eq('id', lead_id)
        .single()

      if (leadError || !lead) {
        console.log(`🔧 Lead not found:`, leadError)
        return {
          statusCode: 404,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({ detail: 'Lead not found' })
        }
      }
      
      console.log(`🔧 Found lead:`, {
        id: lead.id,
        service_category: lead.service_category,
        sub_service: lead.sub_service,
        zip_code: lead.zip_code
      })
      
      const { data: contractor, error: contractorError } = await supabase
        .from('contractors')
        .select('*')
        .eq('email', contractor_email)
        .single()

      if (contractorError || !contractor) {
        console.log(`🔧 Contractor not found:`, contractorError)
        return {
          statusCode: 404,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({ detail: 'Contractor not found' })
        }
      }
      
      console.log(`🔧 Found contractor:`, {
        id: contractor.id,
        business_name: contractor.business_name,
        email: contractor.email,
        wallet_balance: contractor.wallet_balance
      })
      
      const notificationResults = await notifyContractorsForLead(lead, [contractor])
      
      console.log(`🔧 Full notification flow test results:`, notificationResults)
      
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({
          test_type: 'full_notification_flow',
          lead: {
            id: lead.id,
            service_category: lead.service_category,
            sub_service: lead.sub_service,
            zip_code: lead.zip_code
          },
          contractor: {
            id: contractor.id,
            business_name: contractor.business_name,
            email: contractor.email,
            wallet_balance: contractor.wallet_balance
          },
          notification_results: notificationResults,
          timestamp: new Date().toISOString()
        })
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
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
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
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        detail: 'Invalid test_type. Use: direct_email, full_notification_flow, or welcome_email_comparison' 
      })
    }
    
  } catch (error) {
    console.error('🔧 Debug endpoint error:', error)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ detail: 'Internal server error', error: error.message })
    }
  }
}
