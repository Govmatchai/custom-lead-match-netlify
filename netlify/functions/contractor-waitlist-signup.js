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
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
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
    const { first_name, last_name, company, email, phone, trade } = JSON.parse(event.body)

    if (!first_name || !last_name || !company || !email || !phone || !trade) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ success: false, message: 'Missing required fields' })
      }
    }


    const { data: waitlistEntry, error } = await supabase
      .from('contractors_waitlist')
      .insert({
        first_name,
        last_name,
        company,
        email,
        phone,
        trade,
        launch_notified: false
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return {
          statusCode: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ 
            success: false, 
            message: 'You have already joined the waitlist with this email address.' 
          })
        }
      }
      
      if (error.code === '42P01') {
        console.error('contractors_waitlist table does not exist:', error)
        return {
          statusCode: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ 
            success: false, 
            message: 'Waitlist system is being set up. Please try again in a few minutes.' 
          })
        }
      }
      
      console.error('Database insert error:', error)
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ success: false, message: 'Failed to join waitlist' })
      }
    }

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Welcome to Custom Lead Match!</h1>
        <h2 style="color: #10b981;">Your $25 Free Wallet Balance is Reserved 🎁</h2>
        
        <p>Hi ${first_name},</p>
        
        <p>Thanks for joining the Custom Lead Match contractor network. You've taken the first step to getting exclusive, high-quality leads in your trade — leads that are never shared with competitors.</p>
        
        <p><strong>Here's what happens next:</strong></p>
        <ul>
          <li><strong>Launch Day Access</strong> – You'll be among the first contractors invited when we launch in your area.</li>
          <li><strong>$25 Wallet Balance</strong> – Your account will start with $25 in wallet balance.</li>
          <li><strong>Verified Badge (Early Access)</strong> – As an early adopter, you'll earn a Verified Badge to stand out.</li>
        </ul>
        
        <p>👉 Don't miss updates: whitelist support@customleadmatch.com so you never miss a lead notification.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://customleadmatch.netlify.app/contractor-waitlist-confirmed" 
             style="background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Visit Custom Lead Match
          </a>
        </div>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="font-size: 12px; color: #6b7280;">
          Custom Lead Match LLC • support@customleadmatch.com<br>
          TCPA Compliant • SSL Secured • Pay-As-You-Go
        </p>
      </div>
    `

    try {
      await sendEmail(
        email,
        '🎉 Welcome to Custom Lead Match – Your $25 Wallet Balance is Reserved',
        emailHtml
      )
    } catch (emailError) {
      console.log('Email sending failed (may be local dev with dummy key):', emailError)
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'Successfully joined the waitlist!',
        redirect_url: '/contractor-waitlist-confirmed'
      })
    }
  } catch (error) {
    console.error('Error in waitlist signup:', error)
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ success: false, message: 'Failed to join waitlist' })
    }
  }
}
